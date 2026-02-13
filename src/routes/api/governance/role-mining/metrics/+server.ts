import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { listRoleMetrics } from '$lib/api/role-mining';

export const GET: RequestHandler = async ({ url, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) {
		error(401, 'Unauthorized');
	}

	const trend_direction = url.searchParams.get('trend_direction') || undefined;
	const limit = Number(url.searchParams.get('limit') ?? '50');
	const offset = Number(url.searchParams.get('offset') ?? '0');

	const result = await listRoleMetrics(
		{ trend_direction, limit, offset },
		locals.accessToken,
		locals.tenantId,
		fetch
	);

	return json(result);
};
