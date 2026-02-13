import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { hasAdminRole } from '$lib/server/auth';
import { getLicenseAuditTrail } from '$lib/api/licenses';
import { ApiError } from '$lib/api/client';

export const GET: RequestHandler = async ({ url, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) {
		error(401, 'Unauthorized');
	}
	if (!hasAdminRole(locals.user?.roles)) {
		error(403, 'Forbidden');
	}

	try {
		const params: Record<string, string | number> = {};
		const pool_id = url.searchParams.get('pool_id');
		const user_id = url.searchParams.get('user_id');
		const action = url.searchParams.get('action');
		const from_date = url.searchParams.get('from_date');
		const to_date = url.searchParams.get('to_date');
		const limit = url.searchParams.get('limit');
		const offset = url.searchParams.get('offset');

		if (pool_id) params.pool_id = pool_id;
		if (user_id) params.user_id = user_id;
		if (action) params.action = action;
		if (from_date) params.from_date = from_date;
		if (to_date) params.to_date = to_date;
		if (limit) params.limit = Number(limit);
		if (offset) params.offset = Number(offset);

		const result = await getLicenseAuditTrail(
			params,
			locals.accessToken,
			locals.tenantId,
			fetch
		);
		return json(result);
	} catch (e) {
		if (e instanceof ApiError) {
			return json({ error: e.message }, { status: e.status });
		}
		return json({ error: 'Failed to get license audit trail' }, { status: 500 });
	}
};
