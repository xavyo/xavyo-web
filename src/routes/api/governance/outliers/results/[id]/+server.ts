import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getOutlierResult } from '$lib/api/outliers';

export const GET: RequestHandler = async ({ params, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) error(401, 'Unauthorized');
	const result = await getOutlierResult(params.id, locals.accessToken, locals.tenantId, fetch);
	return json(result);
};
