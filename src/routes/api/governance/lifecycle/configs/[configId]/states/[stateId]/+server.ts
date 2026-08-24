import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { updateState, deleteState } from '$lib/api/lifecycle';
import { hasAdminRole } from '$lib/server/auth';
import type { EntitlementAction, UpdateLifecycleStateRequest } from '$lib/api/types';

const ENTITLEMENT_ACTIONS = ['none', 'pause', 'revoke'] as const;

export const PATCH: RequestHandler = async ({ params, request, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) error(401, 'Unauthorized');
	if (!hasAdminRole(locals.user?.roles)) error(403, 'Forbidden');
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
	const data: UpdateLifecycleStateRequest = {};
	if (body.name !== undefined) {
		if (typeof body.name !== 'string' || body.name.length === 0) {
			error(400, 'name must be a non-empty string');
		}
		data.name = body.name;
	}
	if (body.description !== undefined) {
		if (body.description !== null && typeof body.description !== 'string') {
			error(400, 'description must be a string or null');
		}
		data.description = body.description as string | null;
	}
	if (body.is_initial !== undefined) {
		if (typeof body.is_initial !== 'boolean') {
			error(400, 'is_initial must be a boolean');
		}
		data.is_initial = body.is_initial;
	}
	if (body.is_terminal !== undefined) {
		if (typeof body.is_terminal !== 'boolean') {
			error(400, 'is_terminal must be a boolean');
		}
		data.is_terminal = body.is_terminal;
	}
	if (body.entitlement_action !== undefined) {
		if (!ENTITLEMENT_ACTIONS.includes(body.entitlement_action as (typeof ENTITLEMENT_ACTIONS)[number])) {
			error(400, 'entitlement_action is required');
		}
		data.entitlement_action = body.entitlement_action as EntitlementAction;
	}
	if (body.position !== undefined) {
		if (typeof body.position !== 'number') {
			error(400, 'position must be a number');
		}
		data.position = body.position;
	}
	const result = await updateState(params.configId, params.stateId, data, locals.accessToken, locals.tenantId, fetch);
	return json(result);
};

export const DELETE: RequestHandler = async ({ params, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) error(401, 'Unauthorized');
	if (!hasAdminRole(locals.user?.roles)) error(403, 'Forbidden');
	await deleteState(params.configId, params.stateId, locals.accessToken, locals.tenantId, fetch);
	return new Response(null, { status: 204 });
};
