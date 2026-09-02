import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { createServiceProvider } from '$lib/api/federation';
import type { CreateServiceProviderRequest } from '$lib/api/types';
import { applyGroupConfigFields } from '$lib/server/sp-group-fields';
import { JsonObjectError, parseBoundedInteger } from '$lib/utils/json-record';
import { XMLParser } from 'fast-xml-parser';

export const POST: RequestHandler = async ({ request, locals, fetch: svelteKitFetch }) => {
	if (!locals.accessToken || !locals.tenantId) {
		error(401, 'Unauthorized');
	}


	let parsedBody: unknown;
	try {
		parsedBody = await request.json();
	} catch {
		error(400, 'Invalid JSON body');
	}
	if (!parsedBody || typeof parsedBody !== 'object' || Array.isArray(parsedBody)) {
		error(400, 'Invalid JSON body');
	}
	const body = parsedBody as Record<string, unknown>;
	if (body.metadata_url !== undefined && typeof body.metadata_url !== 'string') {
		error(400, 'metadata_url must be a string');
	}
	if (body.metadata_xml !== undefined && typeof body.metadata_xml !== 'string') {
		error(400, 'metadata_xml must be a string');
	}
	const metadata_url = typeof body.metadata_url === 'string' ? body.metadata_url : undefined;
	const metadata_xml = typeof body.metadata_xml === 'string' ? body.metadata_xml : undefined;

	if (!metadata_url && !metadata_xml) {
		error(400, 'Either metadata_url or metadata_xml is required');
	}

	let xml: string;

	if (metadata_url) {
		let res: Response;
		try {
			res = await globalThis.fetch(metadata_url);
		} catch (e) {
			error(400, `Failed to fetch metadata URL: ${e instanceof Error ? e.message : 'Unknown error'}`);
		}
		if (!res.ok) {
			error(400, `Failed to fetch metadata from URL: ${res.status}`);
		}
		xml = await res.text();
	} else {
		xml = metadata_xml!;
	}

	// Parse SAML metadata XML
	const parser = new XMLParser({
		ignoreAttributes: false,
		attributeNamePrefix: '@_',
		removeNSPrefix: true
	});

	let parsed;
	try {
		parsed = parser.parse(xml);
	} catch {
		error(400, 'Invalid XML in metadata');
	}

	const entityDescriptor = parsed.EntityDescriptor;
	if (!entityDescriptor) {
		error(400, 'No EntityDescriptor found in metadata');
	}

	const entityId = entityDescriptor['@_entityID'];
	if (!entityId) {
		error(400, 'No entityID attribute found in EntityDescriptor');
	}

	// Extract SPSSODescriptor
	const spDescriptor = entityDescriptor.SPSSODescriptor;
	if (!spDescriptor) {
		error(400, 'No SPSSODescriptor found in metadata');
	}

	// Extract ACS URLs
	const acsServices = Array.isArray(spDescriptor.AssertionConsumerService)
		? spDescriptor.AssertionConsumerService
		: spDescriptor.AssertionConsumerService
			? [spDescriptor.AssertionConsumerService]
			: [];

	const acsUrls = acsServices
		.map((acs: Record<string, string>) => acs['@_Location'])
		.filter(Boolean) as string[];

	if (acsUrls.length === 0) {
		error(400, 'No AssertionConsumerService URLs found in metadata');
	}

	// Extract certificate (optional)
	let certificate: string | undefined;
	const keyDescriptor = spDescriptor.KeyDescriptor;
	if (keyDescriptor) {
		const kd = Array.isArray(keyDescriptor) ? keyDescriptor[0] : keyDescriptor;
		const x509Cert = kd?.KeyInfo?.X509Data?.X509Certificate;
		if (x509Cert) {
			// Wrap raw base64 in PEM format
			const certBase64 = String(x509Cert).replace(/\s/g, '');
			const lines: string[] = [];
			for (let i = 0; i < certBase64.length; i += 64) {
				lines.push(certBase64.substring(i, i + 64));
			}
			certificate = `-----BEGIN CERTIFICATE-----\n${lines.join('\n')}\n-----END CERTIFICATE-----`;
		}
	}

	// Extract name from Organization or fall back to entityID domain
	let name = 'Imported SP';
	const org = entityDescriptor.Organization;
	if (org) {
		const displayName = org.OrganizationDisplayName;
		if (displayName) {
			name = typeof displayName === 'string' ? displayName : displayName['#text'] || name;
		}
	} else {
		// Try to extract domain from entityId
		try {
			const url = new URL(entityId);
			name = url.hostname;
		} catch {
			// entityId is not a URL, use it directly
			name = entityId.length > 50 ? entityId.substring(0, 50) : entityId;
		}
	}

	// Extract NameIDFormat (optional)
	let nameIdFormat: string | undefined;
	const formats = spDescriptor.NameIDFormat;
	if (formats) {
		nameIdFormat = Array.isArray(formats) ? formats[0] : formats;
	}

	const data: CreateServiceProviderRequest = {
		name,
		entity_id: entityId,
		acs_urls: acsUrls,
		certificate,
		name_id_format: nameIdFormat,
		metadata_url: metadata_url || undefined
	};
	if (body.name !== undefined) {
		if (typeof body.name !== 'string' || body.name.length === 0) {
			error(400, 'name must be a non-empty string');
		}
		data.name = body.name;
	}
	if (body.attribute_mapping !== undefined) {
		if (
			!body.attribute_mapping ||
			typeof body.attribute_mapping !== 'object' ||
			Array.isArray(body.attribute_mapping)
		) {
			error(400, 'attribute_mapping must be an object');
		}
		data.attribute_mapping = body.attribute_mapping as Record<string, unknown>;
	}
	if (body.sign_assertions !== undefined) {
		if (typeof body.sign_assertions !== 'boolean') {
			error(400, 'sign_assertions must be a boolean');
		}
		data.sign_assertions = body.sign_assertions;
	}
	if (body.validate_signatures !== undefined) {
		if (typeof body.validate_signatures !== 'boolean') {
			error(400, 'validate_signatures must be a boolean');
		}
		data.validate_signatures = body.validate_signatures;
	}
	if (body.assertion_validity_seconds !== undefined) {
		try {
			data.assertion_validity_seconds = parseBoundedInteger(
				body.assertion_validity_seconds,
				1,
				31_536_000,
				'assertion_validity_seconds'
			);
		} catch (e) {
			if (e instanceof JsonObjectError) error(400, e.message);
			throw e;
		}
	}
	if (body.slo_url !== undefined) {
		if (typeof body.slo_url !== 'string') {
			error(400, 'slo_url must be a string');
		}
		data.slo_url = body.slo_url;
	}
	if (body.slo_binding !== undefined) {
		if (typeof body.slo_binding !== 'string') {
			error(400, 'slo_binding must be a string');
		}
		data.slo_binding = body.slo_binding;
	}
	applyGroupConfigFields(body, data);
	const result = await createServiceProvider(
		data,
		locals.accessToken,
		locals.tenantId,
		svelteKitFetch
	);

	return json(result, { status: 201 });
};
