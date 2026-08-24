import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getTransitionConditions, updateTransitionConditions } from '$lib/api/lifecycle';
import { hasAdminRole } from '$lib/server/auth';
import type { TransitionCondition, UpdateTransitionConditionsRequest } from '$lib/api/types';

export const GET: RequestHandler = async ({ params, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) error(401, 'Unauthorized');
	const result = await getTransitionConditions(params.configId, params.transitionId, locals.accessToken, locals.tenantId, fetch);
	return json(result);
};

export const PUT: RequestHandler = async ({ params, request, locals, fetch }) => {
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
	if (!Array.isArray(body.conditions)) {
		error(400, 'conditions is required');
	}
	const conditions: TransitionCondition[] = [];
	for (const item of body.conditions) {
		if (!item || typeof item !== 'object' || Array.isArray(item)) {
			error(400, 'conditions items must be objects');
		}
		const rec = item as Record<string, unknown>;
		if (typeof rec.condition_type !== 'string' || rec.condition_type.length === 0) {
			error(400, 'condition_type is required');
		}
		if (typeof rec.attribute_path !== 'string' || rec.attribute_path.length === 0) {
			error(400, 'attribute_path is required');
		}
		if (typeof rec.expression !== 'string' || rec.expression.length === 0) {
			error(400, 'expression is required');
		}
		conditions.push({
			condition_type: rec.condition_type,
			attribute_path: rec.attribute_path,
			expression: rec.expression
		});
	}
	const data: UpdateTransitionConditionsRequest = { conditions };
	const result = await updateTransitionConditions(params.configId, params.transitionId, data, locals.accessToken, locals.tenantId, fetch);
	return json(result);
};
