import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getMetaRole, updateMetaRole, deleteMetaRole } from '$lib/api/meta-roles';
import type { UpdateMetaRoleRequest } from '$lib/api/types';

export const GET: RequestHandler = async ({ params, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) {
		error(401, 'Unauthorized');
	}

	const result = await getMetaRole(params.id, locals.accessToken, locals.tenantId, fetch);

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
	const data: UpdateMetaRoleRequest = {};
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
	if (body.priority !== undefined) {
		if (typeof body.priority !== 'number') {
			error(400, 'priority must be a number');
		}
		data.priority = body.priority;
	}
	if (body.criteria_logic !== undefined) {
		if (body.criteria_logic !== 'and' && body.criteria_logic !== 'or') {
			error(400, 'criteria_logic must be and or or');
		}
		data.criteria_logic = body.criteria_logic;
	}
	const result = await updateMetaRole(params.id, data, locals.accessToken, locals.tenantId, fetch);

	return json(result);
};

export const DELETE: RequestHandler = async ({ params, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) {
		error(401, 'Unauthorized');
	}

	await deleteMetaRole(params.id, locals.accessToken, locals.tenantId, fetch);

	return new Response(null, { status: 204 });
};
