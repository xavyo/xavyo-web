import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getPolicy, updatePolicy, deletePolicy } from '$lib/api/authorization';
import type { UpdatePolicyRequest } from '$lib/api/types';

export const GET: RequestHandler = async ({ params, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) {
		error(401, 'Unauthorized');
	}

	const result = await getPolicy(params.id, locals.accessToken, locals.tenantId, fetch);

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
	const data: UpdatePolicyRequest = {};
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
	if (body.effect !== undefined) {
		if (body.effect !== 'allow' && body.effect !== 'deny') {
			error(400, 'effect must be allow or deny');
		}
		data.effect = body.effect;
	}
	if (body.priority !== undefined) {
		if (typeof body.priority !== 'number') {
			error(400, 'priority must be a number');
		}
		data.priority = body.priority;
	}
	if (body.status !== undefined) {
		if (body.status !== 'active' && body.status !== 'inactive') {
			error(400, 'status must be active or inactive');
		}
		data.status = body.status;
	}
	if (body.resource_type !== undefined) {
		if (typeof body.resource_type !== 'string') {
			error(400, 'resource_type must be a string');
		}
		data.resource_type = body.resource_type;
	}
	if (body.action !== undefined) {
		if (typeof body.action !== 'string') {
			error(400, 'action must be a string');
		}
		data.action = body.action;
	}
	const result = await updatePolicy(params.id, data, locals.accessToken, locals.tenantId, fetch);

	return json(result);
};

export const DELETE: RequestHandler = async ({ params, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) {
		error(401, 'Unauthorized');
	}

	await deletePolicy(params.id, locals.accessToken, locals.tenantId, fetch);

	return new Response(null, { status: 204 });
};
