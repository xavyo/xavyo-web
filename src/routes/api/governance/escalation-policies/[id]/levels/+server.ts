import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { addEscalationLevel } from '$lib/api/approval-workflows';
import type { AddEscalationLevelRequest } from '$lib/api/types';

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
	if (typeof body.level_order !== 'number') {
		error(400, 'level_order is required');
	}
	if (typeof body.timeout_secs !== 'number') {
		error(400, 'timeout_secs is required');
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
		level_order: body.level_order,
		timeout_secs: body.timeout_secs,
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
		if (typeof body.manager_chain_depth !== 'number') {
			error(400, 'manager_chain_depth must be a number');
		}
		data.manager_chain_depth = body.manager_chain_depth;
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
