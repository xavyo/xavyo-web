import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { listRoleMetrics } from '$lib/api/role-mining';
import { listPagination } from '$lib/server/list-pagination';

export const GET: RequestHandler = async ({ url, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) {
		error(401, 'Unauthorized');
	}

	const trend_direction = url.searchParams.get('trend_direction') || undefined;

	const result = await listRoleMetrics(
		{ trend_direction, ...listPagination(url) },
		locals.accessToken,
		locals.tenantId,
		fetch
	);

	return json(result);
};
