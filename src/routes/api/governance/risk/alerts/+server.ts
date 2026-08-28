import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { listRiskAlerts } from '$lib/api/risk';
import { listPagination } from '$lib/server/list-pagination';

export const GET: RequestHandler = async ({ url, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) {
		error(401, 'Unauthorized');
	}

	const result = await listRiskAlerts(
		listPagination(url),
		locals.accessToken,
		locals.tenantId,
		fetch
	);

	return json(result);
};
