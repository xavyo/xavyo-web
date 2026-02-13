import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getCorrelationJobStatus } from '$lib/api/correlation';

export const GET: RequestHandler = async ({ params, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) error(401, 'Unauthorized');
	const result = await getCorrelationJobStatus(params.connectorId, params.jobId, locals.accessToken, locals.tenantId, fetch);
	return json(result);
};
