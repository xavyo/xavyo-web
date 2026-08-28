import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getUserOutlierHistory } from '$lib/api/outliers';
import { listPagination } from '$lib/server/list-pagination';

export const GET: RequestHandler = async ({ params, url, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) error(401, 'Unauthorized');
	const { limit } = listPagination(url);
	const result = await getUserOutlierHistory(params.userId, limit, locals.accessToken, locals.tenantId, fetch);
	return json(result);
};
