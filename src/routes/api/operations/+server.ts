import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { listOperations, triggerOperation } from '$lib/api/operations';
import type { OperationType, TriggerOperationRequest } from '$lib/api/types';

const OPERATION_TYPES = ['create', 'update', 'delete'] as const;

export const GET: RequestHandler = async ({ url, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) {
		error(401, 'Unauthorized');
	}

	const connector_id = url.searchParams.get('connector_id') ?? undefined;
	const user_id = url.searchParams.get('user_id') ?? undefined;
	const status = url.searchParams.get('status') ?? undefined;
	const operation_type = url.searchParams.get('operation_type') ?? undefined;
	const from_date = url.searchParams.get('from_date') ?? undefined;
	const to_date = url.searchParams.get('to_date') ?? undefined;
	const limit = Number(url.searchParams.get('limit') ?? '20');
	const offset = Number(url.searchParams.get('offset') ?? '0');

	const result = await listOperations(
		{ connector_id, user_id, status, operation_type, from_date, to_date, limit, offset },
		locals.accessToken,
		locals.tenantId,
		fetch
	);

	return json(result);
};

export const POST: RequestHandler = async ({ request, locals, fetch }) => {
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
	if (typeof body.connector_id !== 'string' || body.connector_id.length === 0) {
		error(400, 'connector_id is required');
	}
	if (typeof body.user_id !== 'string' || body.user_id.length === 0) {
		error(400, 'user_id is required');
	}
	if (!OPERATION_TYPES.includes(body.operation_type as (typeof OPERATION_TYPES)[number])) {
		error(400, 'operation_type is required');
	}
	if (typeof body.object_class !== 'string' || body.object_class.length === 0) {
		error(400, 'object_class is required');
	}
	if (!body.payload || typeof body.payload !== 'object' || Array.isArray(body.payload)) {
		error(400, 'payload is required');
	}
	const data: TriggerOperationRequest = {
		connector_id: body.connector_id,
		user_id: body.user_id,
		operation_type: body.operation_type as OperationType,
		object_class: body.object_class,
		payload: body.payload as Record<string, unknown>
	};
	if (body.target_uid !== undefined) {
		if (typeof body.target_uid !== 'string') {
			error(400, 'target_uid must be a string');
		}
		data.target_uid = body.target_uid;
	}
	if (body.priority !== undefined) {
		if (typeof body.priority !== 'number') {
			error(400, 'priority must be a number');
		}
		data.priority = body.priority;
	}
	const result = await triggerOperation(data, locals.accessToken, locals.tenantId, fetch);

	return json(result, { status: 201 });
};
