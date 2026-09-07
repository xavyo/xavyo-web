import { redirect, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { env } from '$env/dynamic/private';
import { SYSTEM_TENANT_ID, requestTenantId, stampTenantCookieFromQuery } from '$lib/server/auth';
import { safeInternalPath } from '$lib/utils/redirect';

/**
 * Unauthenticated BFF that starts a social login. The backend authorize
 * endpoint needs an X-Tenant-Id header the browser can't set, so we proxy it
 * server-side (resolving the tenant the same way password login does) and
 * forward the provider redirect back to the browser.
 */
export const GET: RequestHandler = async ({ params, url, cookies, fetch: svelteKitFetch }) => {
	stampTenantCookieFromQuery(cookies, url);
	const tenantId = requestTenantId(url, cookies) || SYSTEM_TENANT_ID;

	const headers = new Headers();
	headers.set('X-Tenant-Id', tenantId);

	const target = new URL(`${env.API_BASE_URL}/auth/social/${params.provider}/authorize`);
	// Carry a post-login destination through the OAuth round-trip when it's safe.
	const redirectAfter = safeInternalPath(url.searchParams.get('redirectTo'), url.origin);
	if (redirectAfter) {
		target.searchParams.set('redirect_after', redirectAfter);
	}

	const res = await svelteKitFetch(target, {
		method: 'GET',
		headers,
		redirect: 'manual'
	});

	const location = res.headers.get('Location');
	if (location) {
		redirect(302, location);
	}

	error(res.status === 200 ? 502 : res.status, 'Failed to start social login');
};
