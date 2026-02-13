import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getNhiRequest } from '$lib/api/nhi-requests';
import { ApiError } from '$lib/api/client';

export const GET: RequestHandler = async ({ locals, params, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}
	try {
		const result = await getNhiRequest(params.id, locals.accessToken, locals.tenantId, fetch);
		return json(result);
	} catch (e) {
		if (e instanceof ApiError) return json({ error: e.message }, { status: e.status });
		return json({ error: 'Internal error' }, { status: 500 });
	}
};
