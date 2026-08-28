import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getStateActions, updateStateActions } from '$lib/api/lifecycle';
import type { LifecycleStateAction, UpdateStateActionsRequest } from '$lib/api/types';

function parseActions(value: unknown, field: string): LifecycleStateAction[] {
	if (!Array.isArray(value)) {
		error(400, `${field} must be an array`);
	}
	const actions: LifecycleStateAction[] = [];
	for (const item of value) {
		if (!item || typeof item !== 'object' || Array.isArray(item)) {
			error(400, `${field} items must be objects`);
		}
		const rec = item as Record<string, unknown>;
		if (typeof rec.action_type !== 'string' || rec.action_type.length === 0) {
			error(400, `${field} action_type is required`);
		}
		if (!rec.parameters || typeof rec.parameters !== 'object' || Array.isArray(rec.parameters)) {
			error(400, `${field} parameters must be an object`);
		}
		actions.push({
			action_type: rec.action_type,
			parameters: rec.parameters as Record<string, unknown>
		});
	}
	return actions;
}

export const GET: RequestHandler = async ({ params, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) error(401, 'Unauthorized');
	const result = await getStateActions(params.configId, params.stateId, locals.accessToken, locals.tenantId, fetch);
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
	const data: UpdateStateActionsRequest = {};
	if (body.entry_actions !== undefined) {
		data.entry_actions = parseActions(body.entry_actions, 'entry_actions');
	}
	if (body.exit_actions !== undefined) {
		data.exit_actions = parseActions(body.exit_actions, 'exit_actions');
	}
	const result = await updateStateActions(params.configId, params.stateId, data, locals.accessToken, locals.tenantId, fetch);
	return json(result);
};
