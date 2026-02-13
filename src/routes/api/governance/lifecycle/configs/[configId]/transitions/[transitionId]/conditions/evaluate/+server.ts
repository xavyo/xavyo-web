import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { evaluateTransitionConditions } from '$lib/api/lifecycle';
import { hasAdminRole } from '$lib/server/auth';

export const POST: RequestHandler = async ({ params, request, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) error(401, 'Unauthorized');
	if (!hasAdminRole(locals.user?.roles)) error(403, 'Forbidden');
	const body = await request.json();
	const result = await evaluateTransitionConditions(params.configId, params.transitionId, body, locals.accessToken, locals.tenantId, fetch);
	return json(result);
};
