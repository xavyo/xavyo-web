import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { dropIdentity } from '$lib/api/power-of-attorney';
import { isDecodableJwt, omitTokenFields, replaceAccessTokenIfJwt } from '$lib/server/auth';

export const POST: RequestHandler = async ({ locals, fetch, cookies }) => {
	if (!locals.accessToken || !locals.tenantId) {
		error(401, 'Unauthorized');
	}

	const result = await dropIdentity(locals.accessToken, locals.tenantId, fetch);

	const originalToken = cookies.get('original_access_token');
	if (originalToken && isDecodableJwt(originalToken)) {
		replaceAccessTokenIfJwt(cookies, originalToken, {
			maxAge: 60 * 60 * 4,
			sameSite: 'lax',
			secure: true
		});
		cookies.delete('original_access_token', { path: '/' });
	}

	return json(omitTokenFields((result ?? {}) as Record<string, unknown>));
};
