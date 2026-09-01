import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { listRoleParameters, addRoleParameter } from '$lib/api/governance-roles';
import type { CreateRoleParameterRequest, ParameterType } from '$lib/api/types';
import { JsonObjectError, parseBoundedInteger } from '$lib/utils/json-record';

const PARAMETER_TYPES: ParameterType[] = ['string', 'integer', 'boolean', 'date', 'enum'];

export const GET: RequestHandler = async ({ params, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) {
		error(401, 'Unauthorized');
	}

	const result = await listRoleParameters(params.id, locals.accessToken, locals.tenantId, fetch);

	return json(result);
};

export const POST: RequestHandler = async ({ params, request, locals, fetch }) => {
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
	if (typeof body.name !== 'string' || body.name.length === 0) {
		error(400, 'name is required');
	}
	if (!PARAMETER_TYPES.includes(body.parameter_type as ParameterType)) {
		error(400, 'parameter_type is required');
	}
	const data: CreateRoleParameterRequest = {
		name: body.name,
		parameter_type: body.parameter_type as ParameterType
	};
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
		try {
			data.display_order = parseBoundedInteger(body.display_order, 0, 1_000_000, 'display_order');
		} catch (e) {
			if (e instanceof JsonObjectError) error(400, e.message);
			throw e;
		}
	}
	const result = await addRoleParameter(params.id, data, locals.accessToken, locals.tenantId, fetch);

	return json(result, { status: 201 });
};
