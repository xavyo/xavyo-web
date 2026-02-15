import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { hasAdminRole } from '$lib/server/auth';
import { createServiceProvider } from '$lib/api/federation';
import { XMLParser } from 'fast-xml-parser';

export const POST: RequestHandler = async ({ request, locals, fetch: svelteKitFetch }) => {
	if (!locals.accessToken || !locals.tenantId) {
		error(401, 'Unauthorized');
	}

	if (!hasAdminRole(locals.user?.roles)) {
		error(403, 'Forbidden');
	}

	const body = await request.json();
	const { metadata_url, metadata_xml } = body as {
		metadata_url?: string;
		metadata_xml?: string;
	};

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

	const result = await createServiceProvider(
		{
			name,
			entity_id: entityId,
			acs_urls: acsUrls,
			certificate,
			name_id_format: nameIdFormat,
			metadata_url: metadata_url || undefined
		},
		locals.accessToken,
		locals.tenantId,
		svelteKitFetch
	);

	return json(result, { status: 201 });
};
