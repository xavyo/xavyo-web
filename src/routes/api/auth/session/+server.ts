import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { setCookies, tenantIdFromJwt } from '$lib/server/auth';
import { refresh } from '$lib/api/auth';
import { ApiError } from '$lib/api/client';

/**
 * Establish a SvelteKit session from tokens delivered in a URL fragment by an
 * SSO callback (social login / OIDC federation). The fragment is client-only, so
 * the callback page POSTs the tokens here.
 *
 * Security: we do NOT trust the posted access token. We validate the refresh
 * token server-side by calling the backend `/auth/refresh`, and only set cookies
 * from the canonical tokens it returns. The posted access token is used only to
 * hint the tenant for that call.
 */
export const POST: RequestHandler = async ({ request, cookies, fetch: svelteKitFetch }) => {
	const body = (await request.json().catch(() => null)) as {
		refresh_token?: unknown;
		access_token?: unknown;
	} | null;

	const refreshToken = typeof body?.refresh_token === 'string' ? body.refresh_token : '';
	if (!refreshToken) {
		error(400, 'refresh_token is required');
	}

	const accessToken = typeof body?.access_token === 'string' ? body.access_token : undefined;
	const tenantHint = accessToken ? tenantIdFromJwt(accessToken) : undefined;

	try {
		const tokens = await refresh(refreshToken, tenantHint, svelteKitFetch);
		setCookies(cookies, tokens);
		return json({ ok: true });
	} catch (e) {
		if (e instanceof ApiError) {
			error(401, 'Invalid or expired session');
		}
		error(500, 'Failed to establish session');
	}
};
