import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { hasAdminRole } from '$lib/server/auth';
import { getScimTarget, updateScimTarget, deleteScimTarget } from '$lib/api/scim-targets';
import { ApiError } from '$lib/api/client';

export const GET: RequestHandler = async ({ params, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) {
		error(401, 'Unauthorized');
	}
	if (!hasAdminRole(locals.user?.roles)) {
		error(403, 'Forbidden');
	}

	try {
		const result = await getScimTarget(params.id, locals.accessToken, locals.tenantId, fetch);
		return json(result);
	} catch (e) {
		if (e instanceof ApiError) {
			return json({ error: e.message }, { status: e.status });
		}
		return json({ error: 'Failed to fetch SCIM target' }, { status: 500 });
	}
};

export const PUT: RequestHandler = async ({ params, request, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) {
		error(401, 'Unauthorized');
	}
	if (!hasAdminRole(locals.user?.roles)) {
		error(403, 'Forbidden');
	}

	try {
		const body = await request.json();
		const result = await updateScimTarget(params.id, body, locals.accessToken, locals.tenantId, fetch);
		return json(result);
	} catch (e) {
		if (e instanceof ApiError) {
			return json({ error: e.message }, { status: e.status });
		}
		return json({ error: 'Failed to update SCIM target' }, { status: 500 });
	}
};

export const DELETE: RequestHandler = async ({ params, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) {
		error(401, 'Unauthorized');
	}
	if (!hasAdminRole(locals.user?.roles)) {
		error(403, 'Forbidden');
	}

	try {
		await deleteScimTarget(params.id, locals.accessToken, locals.tenantId, fetch);
		return new Response(null, { status: 204 });
	} catch (e) {
		if (e instanceof ApiError) {
			return json({ error: e.message }, { status: e.status });
		}
		return json({ error: 'Failed to delete SCIM target' }, { status: 500 });
	}
};
