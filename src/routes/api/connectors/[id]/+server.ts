import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getConnector, updateConnector, deleteConnector } from '$lib/api/connectors';
import type { UpdateConnectorRequest } from '$lib/api/types';

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

	let parsed: unknown;
	try {
		parsed = await request.json();
	} catch {
		error(400, 'Invalid JSON body');
	}
	if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
		error(400, 'Invalid JSON body');
	}
	const body = parsed as Record<string, unknown>;
	const data: UpdateConnectorRequest = {};
	if (body.name !== undefined) {
		if (typeof body.name !== 'string' || body.name.length === 0) {
			error(400, 'name must be a non-empty string');
		}
		data.name = body.name;
	}
	if (body.description !== undefined) {
		if (typeof body.description !== 'string') {
			error(400, 'description must be a string');
		}
		data.description = body.description;
	}
	if (body.config !== undefined) {
		if (!body.config || typeof body.config !== 'object' || Array.isArray(body.config)) {
			error(400, 'config must be an object');
		}
		data.config = body.config as Record<string, unknown>;
	}
	if (body.credentials !== undefined) {
		if (!body.credentials || typeof body.credentials !== 'object' || Array.isArray(body.credentials)) {
			error(400, 'credentials must be an object');
		}
		data.credentials = body.credentials as Record<string, unknown>;
	}
	const result = await updateConnector(params.id, data, locals.accessToken, locals.tenantId, fetch);
	return json(result);
};

export const DELETE: RequestHandler = async ({ params, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) {
		error(401, 'Unauthorized');
	}

	await deleteConnector(params.id, locals.accessToken, locals.tenantId, fetch);
	return new Response(null, { status: 204 });
};
