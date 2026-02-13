import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getAlertSummary } from '$lib/api/outliers';

export const GET: RequestHandler = async ({ locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) error(401, 'Unauthorized');
	const result = await getAlertSummary(locals.accessToken, locals.tenantId, fetch);
	return json(result);
};
