import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { switchContext } from '$lib/api/persona-context';
import { ApiError } from '$lib/api/client';
import { omitTokenFields, replaceAccessTokenIfJwt } from '$lib/server/auth';

export const POST: RequestHandler = async ({ locals, request, cookies, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) return json({ error: 'Unauthorized' }, { status: 401 });
	try {
		let parsed: unknown;
		try {
			parsed = await request.json();
		} catch {
			return json({ error: 'Invalid JSON body' }, { status: 400 });
		}
		if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
			return json({ error: 'Invalid JSON body' }, { status: 400 });
		}
		const body = parsed as Record<string, unknown>;
		if (typeof body.persona_id !== 'string' || body.persona_id.length === 0) {
			return json({ error: 'persona_id is required' }, { status: 400 });
		}
		const result = await switchContext(
			{
				persona_id: body.persona_id,
				reason: typeof body.reason === 'string' ? body.reason : undefined
			},
			locals.accessToken,
			locals.tenantId,
			fetch
		);
		// Store original token for switch-back only when the new token is a real JWT.
		if (
			replaceAccessTokenIfJwt(cookies, result.access_token, {
				maxAge: 60 * 60 * 8,
				sameSite: 'strict',
				secure: true
			})
		) {
			cookies.set('original_access_token', locals.accessToken, {
				path: '/',
				httpOnly: true,
				secure: true,
				sameSite: 'strict',
				maxAge: 60 * 60 * 8 // 8 hours
			});
		}
		return json(omitTokenFields(result as unknown as Record<string, unknown>));
	} catch (e) {
		if (e instanceof ApiError) return json({ error: e.message }, { status: e.status });
		return json({ error: 'Internal error' }, { status: 500 });
	}
};
