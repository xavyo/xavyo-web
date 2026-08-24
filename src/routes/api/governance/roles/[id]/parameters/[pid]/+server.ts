import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import {
	getRoleParameter,
	updateRoleParameter,
	deleteRoleParameter
} from '$lib/api/governance-roles';
import type { UpdateRoleParameterRequest } from '$lib/api/types';

export const GET: RequestHandler = async ({ params, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) {
		error(401, 'Unauthorized');
	}

	const result = await getRoleParameter(
		params.id,
		params.pid,
		locals.accessToken,
		locals.tenantId,
		fetch
	);

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
	const data: UpdateRoleParameterRequest = {};
	if (body.description !== undefined) {
		if (typeof body.description !== 'string') {
			error(400, 'description must be a string');
		}
		data.description = body.description;
	}
	if (body.is_required !== undefined) {
		if (typeof body.is_required !== 'boolean') {
			error(400, 'is_required must be a boolean');
		}
		data.is_required = body.is_required;
	}
	if (body.default_value !== undefined) {
		data.default_value = body.default_value;
	}
	if (body.constraints !== undefined) {
		if (!body.constraints || typeof body.constraints !== 'object' || Array.isArray(body.constraints)) {
			error(400, 'constraints must be an object');
		}
		data.constraints = body.constraints as Record<string, unknown>;
	}
	if (body.display_name !== undefined) {
		if (typeof body.display_name !== 'string') {
			error(400, 'display_name must be a string');
		}
		data.display_name = body.display_name;
	}
	if (body.display_order !== undefined) {
		if (typeof body.display_order !== 'number') {
			error(400, 'display_order must be a number');
		}
		data.display_order = body.display_order;
	}
	const result = await updateRoleParameter(
		params.id,
		params.pid,
		data,
		locals.accessToken,
		locals.tenantId,
		fetch
	);

	return json(result);
};

export const DELETE: RequestHandler = async ({ params, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) {
		error(401, 'Unauthorized');
	}

	await deleteRoleParameter(params.id, params.pid, locals.accessToken, locals.tenantId, fetch);

	return new Response(null, { status: 204 });
};
