import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { updateState, deleteState } from '$lib/api/lifecycle';
import { hasAdminRole } from '$lib/server/auth';

export const PATCH: RequestHandler = async ({ params, request, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) error(401, 'Unauthorized');
	if (!hasAdminRole(locals.user?.roles)) error(403, 'Forbidden');
	const body = await request.json();
	const result = await updateState(params.configId, params.stateId, body, locals.accessToken, locals.tenantId, fetch);
	return json(result);
};

export const DELETE: RequestHandler = async ({ params, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) error(401, 'Unauthorized');
	if (!hasAdminRole(locals.user?.roles)) error(403, 'Forbidden');
	await deleteState(params.configId, params.stateId, locals.accessToken, locals.tenantId, fetch);
	return new Response(null, { status: 204 });
};
