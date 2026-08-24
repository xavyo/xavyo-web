import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getDetectionRule, updateDetectionRule, deleteDetectionRule } from '$lib/api/detection-rules';
import type { UpdateDetectionRuleRequest } from '$lib/api/types';

export const GET: RequestHandler = async ({ params, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) error(401, 'Unauthorized');

	const result = await getDetectionRule(params.id, locals.accessToken, locals.tenantId, fetch);
	return json(result);
};

export const PUT: RequestHandler = async ({ params, request, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) error(401, 'Unauthorized');

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
	const data: UpdateDetectionRuleRequest = {};
	if (body.name !== undefined) {
		if (typeof body.name !== 'string' || body.name.length === 0) {
			error(400, 'name must be a non-empty string');
		}
		data.name = body.name;
	}
	if (body.is_enabled !== undefined) {
		if (typeof body.is_enabled !== 'boolean') {
			error(400, 'is_enabled must be a boolean');
		}
		data.is_enabled = body.is_enabled;
	}
	if (body.priority !== undefined) {
		if (typeof body.priority !== 'number') {
			error(400, 'priority must be a number');
		}
		data.priority = body.priority;
	}
	if (body.parameters !== undefined) {
		if (!body.parameters || typeof body.parameters !== 'object' || Array.isArray(body.parameters)) {
			error(400, 'parameters must be an object');
		}
		data.parameters = body.parameters as Record<string, unknown>;
	}
	if (body.description !== undefined) {
		if (typeof body.description !== 'string') {
			error(400, 'description must be a string');
		}
		data.description = body.description;
	}
	const result = await updateDetectionRule(params.id, data, locals.accessToken, locals.tenantId, fetch);
	return json(result);
};

export const DELETE: RequestHandler = async ({ params, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) error(401, 'Unauthorized');

	await deleteDetectionRule(params.id, locals.accessToken, locals.tenantId, fetch);
	return new Response(null, { status: 204 });
};
