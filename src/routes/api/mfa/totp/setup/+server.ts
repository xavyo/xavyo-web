import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { setupTotp } from '$lib/api/mfa';
import { ApiError } from '$lib/api/client';

export const POST: RequestHandler = async ({ locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) {
		error(401, 'Unauthorized');
	}

	try {
		const result = await setupTotp(locals.accessToken, locals.tenantId, fetch);
		return json(result);
	} catch (e) {
		if (e instanceof ApiError) {
			return json({ error: e.message }, { status: e.status });
		}
		return json({ error: 'An unexpected error occurred' }, { status: 500 });
	}
};
