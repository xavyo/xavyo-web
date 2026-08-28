import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { listSiemDeadLetter } from '$lib/api/siem';
import { ApiError } from '$lib/api/client';
import { listPagination } from '$lib/server/list-pagination';

export const GET: RequestHandler = async ({ params, url, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) {
		error(401, 'Unauthorized');
	}

	try {
		const queryParams: Record<string, number> = {};
		const { limit, offset } = listPagination(url);
		if (limit != null) queryParams.limit = limit;
		if (offset != null) queryParams.offset = offset;

		const result = await listSiemDeadLetter(
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
		return json({ error: 'Failed to list SIEM dead letter entries' }, { status: 500 });
	}
};
