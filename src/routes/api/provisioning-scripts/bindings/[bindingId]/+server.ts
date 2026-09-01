import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getHookBinding, updateHookBinding, deleteHookBinding } from '$lib/api/provisioning-scripts';
import type { UpdateHookBindingRequest } from '$lib/api/types';
import { JsonObjectError, parseBoundedInteger } from '$lib/utils/json-record';

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
		try {
			data.execution_order = parseBoundedInteger(
				body.execution_order,
				0,
				1_000_000,
				'execution_order'
			);
		} catch (e) {
			if (e instanceof JsonObjectError) error(400, e.message);
			throw e;
		}
	}
	if (body.failure_policy !== undefined) {
		if (typeof body.failure_policy !== 'string') {
			error(400, 'failure_policy must be a string');
		}
		data.failure_policy = body.failure_policy;
	}
	if (body.max_retries !== undefined) {
		try {
			data.max_retries = parseBoundedInteger(body.max_retries, 0, 100, 'max_retries');
		} catch (e) {
			if (e instanceof JsonObjectError) error(400, e.message);
			throw e;
		}
	}
	if (body.timeout_seconds !== undefined) {
		try {
			data.timeout_seconds = parseBoundedInteger(body.timeout_seconds, 1, 3600, 'timeout_seconds');
		} catch (e) {
			if (e instanceof JsonObjectError) error(400, e.message);
			throw e;
		}
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
