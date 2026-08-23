import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { assumeIdentity } from '$lib/api/power-of-attorney';
import { omitTokenFields, replaceAccessTokenIfJwt } from '$lib/server/auth';

export const POST: RequestHandler = async ({ params, locals, fetch, cookies }) => {
	if (!locals.accessToken || !locals.tenantId) {
		error(401, 'Unauthorized');
	}

	const result = await assumeIdentity(params.id, locals.accessToken, locals.tenantId, fetch);
	if (
		replaceAccessTokenIfJwt(cookies, result.access_token, {
			maxAge: 60 * 60 * 4,
			sameSite: 'lax',
			secure: true
		})
	) {
		cookies.set('original_access_token', locals.accessToken, {
			path: '/',
			httpOnly: true,
			secure: true,
			sameSite: 'strict',
			maxAge: 60 * 60 * 4
		});
	}
	return json(omitTokenFields(result as unknown as Record<string, unknown>));
};
