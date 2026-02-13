import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { finishWebauthnRegistration } from '$lib/api/mfa';
import { ApiError } from '$lib/api/client';

export const POST: RequestHandler = async ({ request, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) {
		error(401, 'Unauthorized');
	}

	try {
		const body = await request.json();
		const result = await finishWebauthnRegistration(body, locals.accessToken, locals.tenantId, fetch);
		return json(result);
	} catch (e) {
		if (e instanceof ApiError) {
			return json({ error: e.message }, { status: e.status });
		}
		return json({ error: 'An unexpected error occurred' }, { status: 500 });
	}
};
