import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { createState } from '$lib/api/lifecycle';
import { hasAdminRole } from '$lib/server/auth';
import type { CreateLifecycleStateRequest, EntitlementAction } from '$lib/api/types';

const ENTITLEMENT_ACTIONS = ['none', 'pause', 'revoke'] as const;

export const POST: RequestHandler = async ({ params, request, locals, fetch }) => {
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
	if (typeof body.name !== 'string' || body.name.length === 0) {
		error(400, 'name is required');
	}
	if (typeof body.is_initial !== 'boolean') {
		error(400, 'is_initial is required');
	}
	if (typeof body.is_terminal !== 'boolean') {
		error(400, 'is_terminal is required');
	}
	if (!ENTITLEMENT_ACTIONS.includes(body.entitlement_action as (typeof ENTITLEMENT_ACTIONS)[number])) {
		error(400, 'entitlement_action is required');
	}
	if (typeof body.position !== 'number') {
		error(400, 'position is required');
	}
	const data: CreateLifecycleStateRequest = {
		name: body.name,
		is_initial: body.is_initial,
		is_terminal: body.is_terminal,
		entitlement_action: body.entitlement_action as EntitlementAction,
		position: body.position
	};
	if (body.description !== undefined) {
		if (typeof body.description !== 'string') {
			error(400, 'description must be a string');
		}
		data.description = body.description;
	}
	const result = await createState(params.configId, data, locals.accessToken, locals.tenantId, fetch);
	return json(result, { status: 201 });
};
