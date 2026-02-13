import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { bulkDecideNhiCertItems } from '$lib/api/nhi-cert-campaigns';
import { ApiError } from '$lib/api/client';

export const POST: RequestHandler = async ({ locals, request, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) return json({ error: 'Unauthorized' }, { status: 401 });
	try {
		const body = await request.json();
		const result = await bulkDecideNhiCertItems(body, locals.accessToken, locals.tenantId, fetch);
		return json(result);
	} catch (e) {
		if (e instanceof ApiError) return json({ error: e.message }, { status: e.status });
		return json({ error: 'Internal error' }, { status: 500 });
	}
};
