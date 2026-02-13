import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { listExpiringPersonas } from '$lib/api/persona-expiry';
import { hasAdminRole } from '$lib/server/auth';
import { ApiError } from '$lib/api/client';

export const GET: RequestHandler = async ({ locals, url, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) return json({ error: 'Unauthorized' }, { status: 401 });
	if (!hasAdminRole(locals.user?.roles)) return json({ error: 'Forbidden' }, { status: 403 });
	try {
		const days_ahead = url.searchParams.get('days_ahead') ? Number(url.searchParams.get('days_ahead')) : undefined;
		const limit = url.searchParams.get('limit') ? Number(url.searchParams.get('limit')) : undefined;
		const offset = url.searchParams.get('offset') ? Number(url.searchParams.get('offset')) : undefined;
		const result = await listExpiringPersonas({ days_ahead, limit, offset }, locals.accessToken, locals.tenantId, fetch);
		return json(result);
	} catch (e) {
		if (e instanceof ApiError) return json({ error: e.message }, { status: e.status });
		return json({ error: 'Internal error' }, { status: 500 });
	}
};
