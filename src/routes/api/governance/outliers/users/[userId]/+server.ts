import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getUserOutlierHistory } from '$lib/api/outliers';

export const GET: RequestHandler = async ({ params, url, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) error(401, 'Unauthorized');
	const limit = url.searchParams.get('limit') ? Number(url.searchParams.get('limit')) : undefined;
	const result = await getUserOutlierHistory(params.userId, limit, locals.accessToken, locals.tenantId, fetch);
	return json(result);
};
