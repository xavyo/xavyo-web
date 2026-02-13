import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { switchBack } from '$lib/api/persona-context';
import { ApiError } from '$lib/api/client';

export const POST: RequestHandler = async ({ locals, request, cookies, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) return json({ error: 'Unauthorized' }, { status: 401 });
	try {
		const body = await request.json();
		const result = await switchBack(body, locals.accessToken, locals.tenantId, fetch);
		// Restore original token
		const originalToken = cookies.get('original_access_token');
		if (originalToken) {
			cookies.set('access_token', originalToken, {
				path: '/',
				httpOnly: true,
				secure: true,
				sameSite: 'strict',
				maxAge: 60 * 60 * 8
			});
			cookies.delete('original_access_token', { path: '/' });
		} else if (result.access_token) {
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
