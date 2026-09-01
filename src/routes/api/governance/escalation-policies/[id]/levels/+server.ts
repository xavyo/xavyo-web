import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { addEscalationLevel } from '$lib/api/approval-workflows';
import type { AddEscalationLevelRequest } from '$lib/api/types';
import { JsonObjectError, parseBoundedInteger } from '$lib/utils/json-record';

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
	let levelOrder: number;
	let timeoutSecs: number;
	try {
		levelOrder = parseBoundedInteger(body.level_order, 1, 10, 'level_order');
		timeoutSecs = parseBoundedInteger(body.timeout_secs, 60, 31_536_000, 'timeout_secs');
	} catch (e) {
		if (e instanceof JsonObjectError) error(400, e.message);
		throw e;
	}
	if (
		body.target_type !== 'specific_user' &&
		body.target_type !== 'approval_group' &&
		body.target_type !== 'manager' &&
		body.target_type !== 'manager_chain' &&
		body.target_type !== 'tenant_admin'
	) {
		error(400, 'target_type is required');
	}
	const data: AddEscalationLevelRequest = {
		level_order: levelOrder,
		timeout_secs: timeoutSecs,
		target_type: body.target_type
	};
	if (body.level_name !== undefined) {
		if (typeof body.level_name !== 'string') {
			error(400, 'level_name must be a string');
		}
		data.level_name = body.level_name;
	}
	if (body.target_id !== undefined) {
		if (typeof body.target_id !== 'string') {
			error(400, 'target_id must be a string');
		}
		data.target_id = body.target_id;
	}
	if (body.manager_chain_depth !== undefined) {
		try {
			data.manager_chain_depth = parseBoundedInteger(
				body.manager_chain_depth,
				1,
				10,
				'manager_chain_depth'
			);
		} catch (e) {
			if (e instanceof JsonObjectError) error(400, e.message);
			throw e;
		}
	}
	const result = await addEscalationLevel(
		params.id,
		data,
		locals.accessToken,
		locals.tenantId,
		fetch
	);

	return json(result, { status: 201 });
};
