import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { rejectNhiRequest } from '$lib/api/nhi-requests';
import { hasAdminRole } from '$lib/server/auth';
import { ApiError } from '$lib/api/client';

export const POST: RequestHandler = async ({ locals, params, request, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}
	if (!hasAdminRole(locals.user?.roles)) {
		return json({ error: 'Forbidden' }, { status: 403 });
	}
	try {
		const body = await request.json();
		const result = await rejectNhiRequest(params.id, body, locals.accessToken, locals.tenantId, fetch);
		return json(result);
	} catch (e) {
		if (e instanceof ApiError) return json({ error: e.message }, { status: e.status });
		return json({ error: 'Internal error' }, { status: 500 });
	}
};
