import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { listExpiringPersonas } from '$lib/api/persona-expiry';
import { ApiError } from '$lib/api/client';
import { listPagination } from '$lib/server/list-pagination';

export const GET: RequestHandler = async ({ locals, url, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) return json({ error: 'Unauthorized' }, { status: 401 });
	try {
		const days_ahead = url.searchParams.get('days_ahead') ? Number(url.searchParams.get('days_ahead')) : undefined;
		const result = await listExpiringPersonas(
			{ days_ahead, ...listPagination(url) },
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
