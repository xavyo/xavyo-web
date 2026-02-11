import type { Handle } from '@sveltejs/kit';
import { decodeAccessToken, isTokenExpired, setCookies, clearAuthCookies } from '$lib/server/auth';
import { refresh } from '$lib/api/auth';

export const handle: Handle = async ({ event, resolve }) => {
	const accessToken = event.cookies.get('access_token');
	const refreshToken = event.cookies.get('refresh_token');
	const tenantId = event.cookies.get('tenant_id');

	if (accessToken) {
		if (isTokenExpired(accessToken)) {
			// Token expired — try to refresh
			if (refreshToken) {
				try {
					const tokens = await refresh(refreshToken, event.fetch);
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
			} else {
				// No refresh token — clear expired access token
				clearAuthCookies(event.cookies);
			}
		} else {
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
		}
	}

	return resolve(event);
};
