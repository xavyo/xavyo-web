import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { listOutgoingDelegations } from '$lib/api/nhi-delegations';
import { ApiError } from '$lib/api/client';
import { listPagination } from '$lib/server/list-pagination';

export const GET: RequestHandler = async ({ locals, params, url, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}
	try {
		const actor_nhi_id = url.searchParams.get('actor_nhi_id') || undefined;
		const result = await listOutgoingDelegations(
			params.nhiId,
			{ actor_nhi_id, ...listPagination(url) },
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
