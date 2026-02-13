import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getCorrelationTrends } from '$lib/api/correlation';

export const GET: RequestHandler = async ({ params, url, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) error(401, 'Unauthorized');
	const start_date = url.searchParams.get('start_date') ?? '';
	const end_date = url.searchParams.get('end_date') ?? '';
	if (!start_date || !end_date) error(400, 'start_date and end_date are required');
	const result = await getCorrelationTrends(params.connectorId, { start_date, end_date }, locals.accessToken, locals.tenantId, fetch);
	return json(result);
};
