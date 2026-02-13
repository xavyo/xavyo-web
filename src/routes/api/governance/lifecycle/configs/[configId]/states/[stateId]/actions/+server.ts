import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getStateActions, updateStateActions } from '$lib/api/lifecycle';
import { hasAdminRole } from '$lib/server/auth';

export const GET: RequestHandler = async ({ params, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) error(401, 'Unauthorized');
	const result = await getStateActions(params.configId, params.stateId, locals.accessToken, locals.tenantId, fetch);
	return json(result);
};

export const PUT: RequestHandler = async ({ params, request, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) error(401, 'Unauthorized');
	if (!hasAdminRole(locals.user?.roles)) error(403, 'Forbidden');
	const body = await request.json();
	const result = await updateStateActions(params.configId, params.stateId, body, locals.accessToken, locals.tenantId, fetch);
	return json(result);
};
