import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { switchContext } from '$lib/api/persona-context';
import { ApiError } from '$lib/api/client';

export const POST: RequestHandler = async ({ locals, request, cookies, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) return json({ error: 'Unauthorized' }, { status: 401 });
	try {
		const body = await request.json();
		const result = await switchContext(body, locals.accessToken, locals.tenantId, fetch);
		// Store original token for switch-back and set new persona token
		if (result.access_token) {
			cookies.set('original_access_token', locals.accessToken, {
				path: '/',
				httpOnly: true,
				secure: true,
				sameSite: 'strict',
				maxAge: 60 * 60 * 8 // 8 hours
			});
			cookies.set('access_token', result.access_token, {
				path: '/',
				httpOnly: true,
				secure: true,
				sameSite: 'strict',
				maxAge: 60 * 60 * 8
			});
		}
		return json(result);
	} catch (e) {
		if (e instanceof ApiError) return json({ error: e.message }, { status: e.status });
		return json({ error: 'Internal error' }, { status: 500 });
	}
};
