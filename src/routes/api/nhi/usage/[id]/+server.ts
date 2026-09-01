import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getNhiUsageHistory } from '$lib/api/nhi-usage';
import { ApiError } from '$lib/api/client';
import { listPagination } from '$lib/server/list-pagination';

export const GET: RequestHandler = async ({ locals, params, url, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}
	try {
		const result = await getNhiUsageHistory(
			params.id,
			{
				target_resource: url.searchParams.get('target_resource') ?? undefined,
				outcome: url.searchParams.get('outcome') ?? undefined,
				start_date: url.searchParams.get('start_date') ?? undefined,
				end_date: url.searchParams.get('end_date') ?? undefined,
				...listPagination(url)
			},
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
