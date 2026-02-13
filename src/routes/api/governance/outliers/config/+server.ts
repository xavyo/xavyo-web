import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getOutlierConfig, updateOutlierConfig } from '$lib/api/outliers';

export const GET: RequestHandler = async ({ locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) error(401, 'Unauthorized');
	const result = await getOutlierConfig(locals.accessToken, locals.tenantId, fetch);
	return json(result);
};

export const PUT: RequestHandler = async ({ request, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) error(401, 'Unauthorized');
	const body = await request.json();
	const result = await updateOutlierConfig(body, locals.accessToken, locals.tenantId, fetch);
	return json(result);
};
