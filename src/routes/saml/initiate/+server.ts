import { env } from '$env/dynamic/private';
import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

/**
 * IdP-initiated SAML SSO endpoint (browser-navigable).
 *
 * GET /saml/initiate?sp={sp_uuid}&relay_state={url}&tenant={tenant_uuid}
 *
 * If the user has an active Xavyo session, proxies to the API's
 * POST /saml/initiate/{sp_id} and returns the auto-submit HTML form
 * that POSTs the SAML assertion to the SP's ACS URL.
 *
 * If not authenticated, redirects to login with a return URL.
 */
export const GET: RequestHandler = async ({ url, locals, fetch: svelteFetch }) => {
	const spId = url.searchParams.get('sp') ?? '';
	const relayState = url.searchParams.get('relay_state') ?? '';
	const tenant = url.searchParams.get('tenant') ?? '';

	if (!spId) {
		return new Response('Missing required parameter: sp', { status: 400 });
	}

	// If not authenticated, redirect to login with return URL
	if (!locals.user || !locals.accessToken) {
		const returnUrl = url.pathname + url.search;
		const loginUrl = tenant
			? `/login?redirectTo=${encodeURIComponent(returnUrl)}&tenant=${tenant}`
			: `/login?redirectTo=${encodeURIComponent(returnUrl)}`;
		redirect(302, loginUrl);
	}

	const tenantId = tenant || locals.tenantId;
	const baseUrl = env.API_BASE_URL;

	// Proxy to the API's IdP-initiated SSO endpoint
	const body = new URLSearchParams();
	if (relayState) body.set('relay_state', relayState);

	const response = await svelteFetch(`${baseUrl}/saml/initiate/${spId}`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded',
			Authorization: `Bearer ${locals.accessToken}`,
			'X-Tenant-ID': tenantId ?? ''
		},
		body: body.toString()
	});

	if (!response.ok) {
		const text = await response.text();
		return new Response(`SAML initiation failed: ${text}`, { status: response.status });
	}

	// Return the auto-submit HTML form from the API as-is
	const html = await response.text();
	return new Response(html, {
		headers: { 'Content-Type': 'text/html' }
	});
};
