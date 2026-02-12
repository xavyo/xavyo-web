import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getCorrelationStatistics } from '$lib/api/correlation';

export const GET: RequestHandler = async ({ params, url, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) error(401, 'Unauthorized');
	const start_date = url.searchParams.get('start_date') ?? undefined;
	const end_date = url.searchParams.get('end_date') ?? undefined;
	const result = await getCorrelationStatistics(params.connectorId, { start_date, end_date }, locals.accessToken, locals.tenantId, fetch);
	return json(result);
};
