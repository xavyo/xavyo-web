import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { dropIdentity } from '$lib/api/power-of-attorney';

export const POST: RequestHandler = async ({ locals, fetch, cookies }) => {
	if (!locals.accessToken || !locals.tenantId) {
		error(401, 'Unauthorized');
	}

	const result = await dropIdentity(locals.accessToken, locals.tenantId, fetch);

	// Restore the original access token if available
	const originalToken = cookies.get('original_access_token');
	if (originalToken) {
		cookies.set('access_token', originalToken, {
			path: '/',
			httpOnly: true,
			secure: true,
			sameSite: 'lax',
			maxAge: 60 * 60 * 4
		});
		cookies.delete('original_access_token', { path: '/' });
	}

	return json(result);
};
