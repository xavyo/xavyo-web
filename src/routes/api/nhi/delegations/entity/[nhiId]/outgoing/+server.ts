import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { listOutgoingDelegations } from '$lib/api/nhi-delegations';
import { ApiError } from '$lib/api/client';

export const GET: RequestHandler = async ({ locals, params, url, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}
	try {
		const limit = url.searchParams.get('limit') ? Number(url.searchParams.get('limit')) : undefined;
		const offset = url.searchParams.get('offset') ? Number(url.searchParams.get('offset')) : undefined;
		const result = await listOutgoingDelegations(params.nhiId, { limit, offset }, locals.accessToken, locals.tenantId, fetch);
		return json(result);
	} catch (e) {
		if (e instanceof ApiError) return json({ error: e.message }, { status: e.status });
		return json({ error: 'Internal error' }, { status: 500 });
	}
};
