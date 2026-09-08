import { redirect, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { env } from '$env/dynamic/private';
import { SYSTEM_TENANT_ID, requestTenantId, stampTenantCookieFromQuery } from '$lib/server/auth';
import { safeInternalPath } from '$lib/utils/redirect';

/**
 * Unauthenticated BFF that starts an enterprise-SSO (OIDC federation) login.
 * The backend authorize endpoint needs an X-Tenant-Id header the browser can't
 * set, so we resolve the tenant server-side, pass the email as login_hint (the
 * backend resolves the IdP via Home Realm Discovery), and forward the provider
 * redirect back to the browser.
 */
export const GET: RequestHandler = async ({ url, cookies, fetch: svelteKitFetch }) => {
	stampTenantCookieFromQuery(cookies, url);
	const tenantId = requestTenantId(url, cookies) || SYSTEM_TENANT_ID;

	const loginHint = url.searchParams.get('login_hint');
	if (!loginHint) {
		error(400, 'login_hint is required');
	}

	const target = new URL(`${env.API_BASE_URL}/auth/federation/authorize`);
	target.searchParams.set('login_hint', loginHint);
	// Land the completed login back in the SPA so it can establish the session.
	const redirectTo = safeInternalPath(url.searchParams.get('redirectTo'), url.origin);
	const callback = new URL('/auth/callback', url.origin);
	if (redirectTo) {
		callback.searchParams.set('redirectTo', redirectTo);
	}
	target.searchParams.set('redirect_uri', callback.toString());

	const res = await svelteKitFetch(target, {
		method: 'GET',
		headers: { 'X-Tenant-Id': tenantId },
		redirect: 'manual'
	});

	const location = res.headers.get('Location');
	if (location) {
		redirect(302, location);
	}

	error(res.status === 200 ? 502 : res.status, 'Failed to start single sign-on');
};
