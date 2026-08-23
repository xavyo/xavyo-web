import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { switchBack } from '$lib/api/persona-context';
import { ApiError } from '$lib/api/client';
import { isDecodableJwt, omitTokenFields, replaceAccessTokenIfJwt } from '$lib/server/auth';

export const POST: RequestHandler = async ({ locals, request, cookies, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) return json({ error: 'Unauthorized' }, { status: 401 });
	try {
		const body = await request.json();
		const result = await switchBack(body, locals.accessToken, locals.tenantId, fetch);
		const cookieOpts = { maxAge: 60 * 60 * 8, sameSite: 'strict' as const, secure: true };
		const originalToken = cookies.get('original_access_token');
		if (originalToken && isDecodableJwt(originalToken)) {
			replaceAccessTokenIfJwt(cookies, originalToken, cookieOpts);
			cookies.delete('original_access_token', { path: '/' });
		} else {
			replaceAccessTokenIfJwt(cookies, result.access_token, cookieOpts);
		}
		return json(omitTokenFields(result as unknown as Record<string, unknown>));
	} catch (e) {
		if (e instanceof ApiError) return json({ error: e.message }, { status: e.status });
		return json({ error: 'Internal error' }, { status: 500 });
	}
};
