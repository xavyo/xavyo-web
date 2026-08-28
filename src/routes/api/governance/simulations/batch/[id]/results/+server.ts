import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { listBatchSimulationResults } from '$lib/api/simulations';
import { ApiError } from '$lib/api/client';
import { listPagination } from '$lib/server/list-pagination';

export const GET: RequestHandler = async ({ params, url, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) error(401, 'Unauthorized');

	try {
		const user_id = url.searchParams.get('user_id') || undefined;
		const has_warnings = url.searchParams.get('has_warnings') === 'true' ? true : undefined;
		const result = await listBatchSimulationResults(
			params.id,
			{ user_id, has_warnings, ...listPagination(url) },
			locals.accessToken,
			locals.tenantId,
			fetch
		);
		return json(result);
	} catch (e) {
		if (e instanceof ApiError) error(e.status, e.message);
		throw e;
	}
};
