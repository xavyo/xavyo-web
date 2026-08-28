import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { listHookBindings, createHookBinding } from '$lib/api/provisioning-scripts';
import type { CreateHookBindingRequest } from '$lib/api/types';
import { pagePagination } from '$lib/server/list-pagination';

const HOOK_PHASES = ['before', 'after'] as const;
const OPERATION_TYPES = ['create', 'update', 'delete', 'enable', 'disable'] as const;

export const GET: RequestHandler = async ({ url, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) error(401, 'Unauthorized');

	const connector_id = url.searchParams.get('connector_id') ?? undefined;
	const script_id = url.searchParams.get('script_id') ?? undefined;
	const hook_phase = url.searchParams.get('hook_phase') ?? undefined;
	const operation_type = url.searchParams.get('operation_type') ?? undefined;

	const result = await listHookBindings(
		{ connector_id, script_id, hook_phase, operation_type, ...pagePagination(url) },
		locals.accessToken,
		locals.tenantId,
		fetch
	);
	return json(result);
};

export const POST: RequestHandler = async ({ request, locals, fetch }) => {
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
	if (typeof body.script_id !== 'string' || body.script_id.length === 0) {
		error(400, 'script_id is required');
	}
	if (typeof body.connector_id !== 'string' || body.connector_id.length === 0) {
		error(400, 'connector_id is required');
	}
	if (!HOOK_PHASES.includes(body.hook_phase as (typeof HOOK_PHASES)[number])) {
		error(400, 'hook_phase is required');
	}
	if (!OPERATION_TYPES.includes(body.operation_type as (typeof OPERATION_TYPES)[number])) {
		error(400, 'operation_type is required');
	}
	if (typeof body.execution_order !== 'number') {
		error(400, 'execution_order is required');
	}
	const data: CreateHookBindingRequest = {
		script_id: body.script_id,
		connector_id: body.connector_id,
		hook_phase: body.hook_phase as string,
		operation_type: body.operation_type as string,
		execution_order: body.execution_order
	};
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
	const result = await createHookBinding(data, locals.accessToken, locals.tenantId, fetch);
	return json(result, { status: 201 });
};
