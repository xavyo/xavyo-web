import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { listIncomingDelegations } from '$lib/api/nhi-delegations';
import { ApiError } from '$lib/api/client';
import { listPagination } from '$lib/server/list-pagination';

export const GET: RequestHandler = async ({ locals, params, url, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}
	try {
		const principal_id = url.searchParams.get('principal_id') || undefined;
		const result = await listIncomingDelegations(
			params.nhiId,
			{ principal_id, ...listPagination(url) },
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
