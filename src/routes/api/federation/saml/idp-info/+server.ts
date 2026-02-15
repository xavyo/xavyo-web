import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { hasAdminRole } from '$lib/server/auth';
import { env } from '$env/dynamic/private';
import { XMLParser } from 'fast-xml-parser';

export const GET: RequestHandler = async ({ locals, fetch, url }) => {
	if (!locals.accessToken || !locals.tenantId) {
		error(401, 'Unauthorized');
	}

	if (!hasAdminRole(locals.user?.roles)) {
		error(403, 'Forbidden');
	}

	const baseUrl = env.API_BASE_URL;
	const tenantId = locals.tenantId;

	// Fetch the backend's own metadata XML — it contains the correct public-facing URLs
	const res = await fetch(`${baseUrl}/saml/metadata?tenant=${tenantId}`, {
		headers: { 'X-Tenant-Id': tenantId }
	});

	if (!res.ok) {
		error(res.status, 'Failed to fetch IdP metadata from backend');
	}

	const xml = await res.text();

	const parser = new XMLParser({
		ignoreAttributes: false,
		attributeNamePrefix: '@_',
		removeNSPrefix: true
	});

	let parsed;
	try {
		parsed = parser.parse(xml);
	} catch {
		error(500, 'Failed to parse IdP metadata XML');
	}

	const entityDescriptor = parsed.EntityDescriptor;
	if (!entityDescriptor) {
		error(500, 'No EntityDescriptor found in IdP metadata');
	}

	// Entity ID from the metadata's entityID attribute
	const entityId = entityDescriptor['@_entityID'] ?? '';

	// SSO URL from IDPSSODescriptor > SingleSignOnService
	let ssoUrl = '';
	const idpDescriptor = entityDescriptor.IDPSSODescriptor;
	if (idpDescriptor) {
		const ssoServices = Array.isArray(idpDescriptor.SingleSignOnService)
			? idpDescriptor.SingleSignOnService
			: idpDescriptor.SingleSignOnService
				? [idpDescriptor.SingleSignOnService]
				: [];
		// Prefer HTTP-POST binding, fall back to first available
		const postBinding = ssoServices.find(
			(s: Record<string, string>) =>
				s['@_Binding'] === 'urn:oasis:names:tc:SAML:2.0:bindings:HTTP-POST'
		);
		const redirectBinding = ssoServices.find(
			(s: Record<string, string>) =>
				s['@_Binding'] === 'urn:oasis:names:tc:SAML:2.0:bindings:HTTP-Redirect'
		);
		ssoUrl = (postBinding ?? redirectBinding ?? ssoServices[0])?.['@_Location'] ?? '';
	}

	// Metadata URL: the BFF proxy route (uses the request's own origin for a public-facing URL)
	const metadataUrl = `${url.origin}/api/federation/saml/metadata`;

	// Derive IdP-initiated SSO base URL from SSO URL
	// SSO URL is like https://host/saml/sso — replace /sso with /initiate
	let initiateBaseUrl = '';
	if (ssoUrl) {
		try {
			const ssoUrlObj = new URL(ssoUrl);
			ssoUrlObj.pathname = ssoUrlObj.pathname.replace(/\/sso$/, '/initiate');
			initiateBaseUrl = ssoUrlObj.toString();
		} catch {
			// If URL parsing fails, try simple string replacement
			initiateBaseUrl = ssoUrl.replace(/\/sso$/, '/initiate');
		}
	}

	return json({
		entity_id: entityId,
		sso_url: ssoUrl,
		metadata_url: metadataUrl,
		initiate_base_url: initiateBaseUrl
	});
};
