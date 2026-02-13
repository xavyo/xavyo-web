import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { enableOutlierDetection } from '$lib/api/outliers';

export const POST: RequestHandler = async ({ locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) error(401, 'Unauthorized');
	const result = await enableOutlierDetection(locals.accessToken, locals.tenantId, fetch);
	return json(result);
};
