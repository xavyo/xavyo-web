import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getDetectionRule, updateDetectionRule, deleteDetectionRule } from '$lib/api/detection-rules';

export const GET: RequestHandler = async ({ params, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) error(401, 'Unauthorized');

	const result = await getDetectionRule(params.id, locals.accessToken, locals.tenantId, fetch);
	return json(result);
};

export const PUT: RequestHandler = async ({ params, request, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) error(401, 'Unauthorized');

	const body = await request.json();
	const result = await updateDetectionRule(params.id, body, locals.accessToken, locals.tenantId, fetch);
	return json(result);
};

export const DELETE: RequestHandler = async ({ params, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) error(401, 'Unauthorized');

	await deleteDetectionRule(params.id, locals.accessToken, locals.tenantId, fetch);
	return new Response(null, { status: 204 });
};
