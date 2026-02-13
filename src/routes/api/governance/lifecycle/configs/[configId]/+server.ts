import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getLifecycleConfig, updateLifecycleConfig, deleteLifecycleConfig } from '$lib/api/lifecycle';
import { hasAdminRole } from '$lib/server/auth';

export const GET: RequestHandler = async ({ params, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) error(401, 'Unauthorized');
	const result = await getLifecycleConfig(params.configId, locals.accessToken, locals.tenantId, fetch);
	return json(result);
};

export const PATCH: RequestHandler = async ({ params, request, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) error(401, 'Unauthorized');
	if (!hasAdminRole(locals.user?.roles)) error(403, 'Forbidden');
	const body = await request.json();
	const result = await updateLifecycleConfig(params.configId, body, locals.accessToken, locals.tenantId, fetch);
	return json(result);
};

export const DELETE: RequestHandler = async ({ params, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) error(401, 'Unauthorized');
	if (!hasAdminRole(locals.user?.roles)) error(403, 'Forbidden');
	await deleteLifecycleConfig(params.configId, locals.accessToken, locals.tenantId, fetch);
	return new Response(null, { status: 204 });
};
