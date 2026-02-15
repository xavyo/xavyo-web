import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { listDelegationGrants, createDelegationGrant } from '$lib/api/nhi-delegations';
import { ApiError } from '$lib/api/client';

export const GET: RequestHandler = async ({ locals, url, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}
	try {
		const principal_id = url.searchParams.get('principal_id') || undefined;
		const actor_nhi_id = url.searchParams.get('actor_nhi_id') || undefined;
		const status = url.searchParams.get('status') || undefined;
		const limit = url.searchParams.get('limit') ? Number(url.searchParams.get('limit')) : undefined;
		const offset = url.searchParams.get('offset') ? Number(url.searchParams.get('offset')) : undefined;
		const result = await listDelegationGrants({ principal_id, actor_nhi_id, status, limit, offset }, locals.accessToken, locals.tenantId, fetch);
		return json(result);
	} catch (e) {
		if (e instanceof ApiError) return json({ error: e.message }, { status: e.status });
		return json({ error: 'Internal error' }, { status: 500 });
	}
};

export const POST: RequestHandler = async ({ locals, request, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}
	try {
		const body = await request.json();
		const result = await createDelegationGrant(body, locals.accessToken, locals.tenantId, fetch);
		return json(result, { status: 201 });
	} catch (e) {
		if (e instanceof ApiError) return json({ error: e.message }, { status: e.status });
		return json({ error: 'Internal error' }, { status: 500 });
	}
};
