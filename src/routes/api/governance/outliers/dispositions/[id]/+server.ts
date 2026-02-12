import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getDisposition, updateDisposition } from '$lib/api/outliers';

export const GET: RequestHandler = async ({ params, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) error(401, 'Unauthorized');
	const result = await getDisposition(params.id, locals.accessToken, locals.tenantId, fetch);
	return json(result);
};

export const PUT: RequestHandler = async ({ params, request, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) error(401, 'Unauthorized');
	const body = await request.json();
	const result = await updateDisposition(params.id, body, locals.accessToken, locals.tenantId, fetch);
	return json(result);
};
