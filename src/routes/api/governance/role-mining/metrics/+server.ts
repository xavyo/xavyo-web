import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { listRoleMetrics } from '$lib/api/role-mining';
import { finiteNumber, listPagination } from '$lib/server/list-pagination';

export const GET: RequestHandler = async ({ url, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) {
		error(401, 'Unauthorized');
	}

	const trend_direction = url.searchParams.get('trend_direction') || undefined;
	const role_id = url.searchParams.get('role_id') || undefined;
	const min_utilization = finiteNumber(url.searchParams.get('min_utilization'));
	const max_utilization = finiteNumber(url.searchParams.get('max_utilization'));

	const result = await listRoleMetrics(
		{ trend_direction, role_id, min_utilization, max_utilization, ...listPagination(url) },
		locals.accessToken,
		locals.tenantId,
		fetch
	);

	return json(result);
};
