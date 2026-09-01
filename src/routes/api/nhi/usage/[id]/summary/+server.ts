import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getNhiUsageSummary } from '$lib/api/nhi-usage';
import { ApiError } from '$lib/api/client';
import { finiteInteger } from '$lib/server/list-pagination';

export const GET: RequestHandler = async ({ locals, params, url, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}
	try {
		const result = await getNhiUsageSummary(
			params.id,
			locals.accessToken,
			locals.tenantId,
			fetch,
			{ period_days: finiteInteger(url.searchParams.get('period_days')) }
		);
		return json(result);
	} catch (e) {
		if (e instanceof ApiError) return json({ error: e.message }, { status: e.status });
		return json({ error: 'Internal error' }, { status: 500 });
	}
};
