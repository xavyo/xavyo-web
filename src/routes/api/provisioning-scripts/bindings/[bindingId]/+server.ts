import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getHookBinding, updateHookBinding, deleteHookBinding } from '$lib/api/provisioning-scripts';
import type { UpdateHookBindingRequest } from '$lib/api/types';

export const GET: RequestHandler = async ({ params, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) error(401, 'Unauthorized');

	const result = await getHookBinding(params.bindingId, locals.accessToken, locals.tenantId, fetch);
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
	const data: UpdateHookBindingRequest = {};
	if (body.execution_order !== undefined) {
		if (typeof body.execution_order !== 'number') {
			error(400, 'execution_order must be a number');
		}
		data.execution_order = body.execution_order;
	}
	if (body.failure_policy !== undefined) {
		if (typeof body.failure_policy !== 'string') {
			error(400, 'failure_policy must be a string');
		}
		data.failure_policy = body.failure_policy;
	}
	if (body.max_retries !== undefined) {
		if (typeof body.max_retries !== 'number') {
			error(400, 'max_retries must be a number');
		}
		data.max_retries = body.max_retries;
	}
	if (body.timeout_seconds !== undefined) {
		if (typeof body.timeout_seconds !== 'number') {
			error(400, 'timeout_seconds must be a number');
		}
		data.timeout_seconds = body.timeout_seconds;
	}
	if (body.enabled !== undefined) {
		if (typeof body.enabled !== 'boolean') {
			error(400, 'enabled must be a boolean');
		}
		data.enabled = body.enabled;
	}
	const result = await updateHookBinding(
		params.bindingId,
		data,
		locals.accessToken,
		locals.tenantId,
		fetch
	);
	return json(result);
};

export const DELETE: RequestHandler = async ({ params, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) error(401, 'Unauthorized');

	await deleteHookBinding(params.bindingId, locals.accessToken, locals.tenantId, fetch);
	return new Response(null, { status: 204 });
};
