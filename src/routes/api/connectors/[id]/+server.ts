import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getConnector, updateConnector, deleteConnector } from '$lib/api/connectors';

export const GET: RequestHandler = async ({ params, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) {
		error(401, 'Unauthorized');
	}

	const result = await getConnector(params.id, locals.accessToken, locals.tenantId, fetch);
	return json(result);
};

export const PUT: RequestHandler = async ({ params, request, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) {
		error(401, 'Unauthorized');
	}

	const body = await request.json();
	const result = await updateConnector(params.id, body, locals.accessToken, locals.tenantId, fetch);
	return json(result);
};

export const DELETE: RequestHandler = async ({ params, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) {
		error(401, 'Unauthorized');
	}

	await deleteConnector(params.id, locals.accessToken, locals.tenantId, fetch);
	return new Response(null, { status: 204 });
};
