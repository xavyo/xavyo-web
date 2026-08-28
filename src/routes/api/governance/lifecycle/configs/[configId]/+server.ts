import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getLifecycleConfig, updateLifecycleConfig, deleteLifecycleConfig } from '$lib/api/lifecycle';
import { hasAdminRole } from '$lib/server/auth';
import type { UpdateLifecycleConfigRequest } from '$lib/api/types';

export const GET: RequestHandler = async ({ params, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) error(401, 'Unauthorized');
	const result = await getLifecycleConfig(params.configId, locals.accessToken, locals.tenantId, fetch);
	return json(result);
};

export const PATCH: RequestHandler = async ({ params, request, locals, fetch }) => {
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
	const data: UpdateLifecycleConfigRequest = {};
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
	if (body.is_active !== undefined) {
		if (typeof body.is_active !== 'boolean') {
			error(400, 'is_active must be a boolean');
		}
		data.is_active = body.is_active;
	}
	if (body.auto_assign_initial_state !== undefined) {
		if (typeof body.auto_assign_initial_state !== 'boolean') {
			error(400, 'auto_assign_initial_state must be a boolean');
		}
		data.auto_assign_initial_state = body.auto_assign_initial_state;
	}
	const result = await updateLifecycleConfig(params.configId, data, locals.accessToken, locals.tenantId, fetch);
	return json(result);
};

export const DELETE: RequestHandler = async ({ params, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) error(401, 'Unauthorized');
	if (!hasAdminRole(locals.user?.roles)) error(403, 'Forbidden');
	await deleteLifecycleConfig(params.configId, locals.accessToken, locals.tenantId, fetch);
	return new Response(null, { status: 204 });
};
