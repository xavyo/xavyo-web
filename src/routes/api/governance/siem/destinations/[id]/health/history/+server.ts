import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { hasAdminRole } from '$lib/server/auth';
import { getSiemHealthHistory } from '$lib/api/siem';
import { ApiError } from '$lib/api/client';

export const GET: RequestHandler = async ({ params, url, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) {
		error(401, 'Unauthorized');
	}
	if (!hasAdminRole(locals.user?.roles)) {
		error(403, 'Forbidden');
	}

	try {
		const queryParams: Record<string, string | number> = {};
		const limit = url.searchParams.get('limit');
		const offset = url.searchParams.get('offset');

		if (limit) queryParams.limit = Number(limit);
		if (offset) queryParams.offset = Number(offset);

		const result = await getSiemHealthHistory(
			params.id,
			queryParams,
			locals.accessToken,
			locals.tenantId,
			fetch
		);
		return json(result);
	} catch (e) {
		if (e instanceof ApiError) {
			return json({ error: e.message }, { status: e.status });
		}
		return json({ error: 'Failed to get SIEM health history' }, { status: 500 });
	}
};
