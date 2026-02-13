import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getSemiManualApplication, configureSemiManual, removeSemiManualConfig } from '$lib/api/semi-manual';

export const GET: RequestHandler = async ({ params, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) error(401, 'Unauthorized');

	const result = await getSemiManualApplication(params.id, locals.accessToken, locals.tenantId, fetch);
	return json(result);
};

export const PUT: RequestHandler = async ({ params, request, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) error(401, 'Unauthorized');

	const body = await request.json();
	const result = await configureSemiManual(params.id, body, locals.accessToken, locals.tenantId, fetch);
	return json(result);
};

export const DELETE: RequestHandler = async ({ params, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) error(401, 'Unauthorized');

	await removeSemiManualConfig(params.id, locals.accessToken, locals.tenantId, fetch);
	return new Response(null, { status: 204 });
};
