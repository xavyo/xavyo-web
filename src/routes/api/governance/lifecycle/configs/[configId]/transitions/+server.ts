import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { createTransition } from '$lib/api/lifecycle';
import type { CreateLifecycleTransitionRequest } from '$lib/api/types';
import { JsonObjectError, parseBoundedInteger } from '$lib/utils/json-record';

export const POST: RequestHandler = async ({ params, request, locals, fetch }) => {
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
	if (typeof body.name !== 'string' || body.name.length === 0) {
		error(400, 'name is required');
	}
	if (typeof body.from_state_id !== 'string' || body.from_state_id.length === 0) {
		error(400, 'from_state_id is required');
	}
	if (typeof body.to_state_id !== 'string' || body.to_state_id.length === 0) {
		error(400, 'to_state_id is required');
	}
	const data: CreateLifecycleTransitionRequest = {
		name: body.name,
		from_state_id: body.from_state_id,
		to_state_id: body.to_state_id
	};
	if (body.requires_approval !== undefined) {
		if (typeof body.requires_approval !== 'boolean') {
			error(400, 'requires_approval must be a boolean');
		}
		data.requires_approval = body.requires_approval;
	}
	if (body.approval_workflow_id !== undefined) {
		if (typeof body.approval_workflow_id !== 'string') {
			error(400, 'approval_workflow_id must be a string');
		}
		data.approval_workflow_id = body.approval_workflow_id;
	}
	if (body.grace_period_hours !== undefined) {
		try {
			data.grace_period_hours = parseBoundedInteger(
				body.grace_period_hours,
				0,
				8760,
				'grace_period_hours'
			);
		} catch (e) {
			if (e instanceof JsonObjectError) error(400, e.message);
			throw e;
		}
	}
	const result = await createTransition(params.configId, data, locals.accessToken, locals.tenantId, fetch);
	return json(result, { status: 201 });
};
