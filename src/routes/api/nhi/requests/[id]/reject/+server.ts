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
		if (typeof body.reason !== 'string' || body.reason.length === 0) {
			return json({ error: 'reason is required' }, { status: 400 });
		}
		const result = await rejectNhiRequest(
			params.id,
			{ reason: body.reason },
			locals.accessToken,
			locals.tenantId,
			fetch
		);
		return json(result);
	} catch (e) {
		if (e instanceof ApiError) return json({ error: e.message }, { status: e.status });
		return json({ error: 'Internal error' }, { status: 500 });
	}
};
