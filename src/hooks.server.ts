import type { Handle } from '@sveltejs/kit';
import { decodeAccessToken, isTokenExpired, setCookies, clearAuthCookies } from '$lib/server/auth';
import { refresh } from '$lib/api/auth';

export const handle: Handle = async ({ event, resolve }) => {
	const accessToken = event.cookies.get('access_token');
	const refreshToken = event.cookies.get('refresh_token');
	const tenantId = event.cookies.get('tenant_id');

	if (accessToken && !isTokenExpired(accessToken)) {
		// Token is still valid
		const claims = decodeAccessToken(accessToken);
		if (claims) {
			event.locals.user = {
				id: claims.sub,
				email: claims.email ?? '',
				roles: claims.roles ?? []
			};
			event.locals.accessToken = accessToken;
			event.locals.tenantId = claims.tid ?? tenantId;
		}
	} else if (refreshToken) {
		// Token missing or expired — try to refresh
		try {
			const tokens = await refresh(refreshToken, tenantId, event.fetch);
			setCookies(event.cookies, tokens);

			const claims = decodeAccessToken(tokens.access_token);
			if (claims) {
				event.locals.user = {
					id: claims.sub,
					email: claims.email ?? '',
					roles: claims.roles ?? []
				};
				event.locals.accessToken = tokens.access_token;
				event.locals.tenantId = claims.tid ?? tenantId;
			}
		} catch {
			// Refresh failed — clear everything
			clearAuthCookies(event.cookies);
		}
	} else if (accessToken) {
		// Expired token with no refresh token — clear
		clearAuthCookies(event.cookies);
	}

	const response = await resolve(event);

	// Security headers — prevent clickjacking (RFC 6749 §10.13) and other attacks
	response.headers.set('X-Frame-Options', 'DENY');
	response.headers.set('Content-Security-Policy', "frame-ancestors 'none'");
	response.headers.set('X-Content-Type-Options', 'nosniff');
	response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

	return response;
};
