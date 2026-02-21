import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { listSecrets, storeSecret } from '$lib/api/nhi-vault';
import { ApiError } from '$lib/api/client';
import { hasAdminRole } from '$lib/server/auth';

export const GET: RequestHandler = async ({ params, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) {
		error(401, 'Unauthorized');
	}
	if (!hasAdminRole(locals.user?.roles)) {
		error(403, 'Admin role required');
	}
	try {
		const result = await listSecrets(params.nhiId, locals.accessToken, locals.tenantId, fetch);
		return json(result);
	} catch (e) {
		if (e instanceof ApiError) error(e.status, e.message);
		throw e;
	}
};

export const POST: RequestHandler = async ({ params, request, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) {
		error(401, 'Unauthorized');
	}
	if (!hasAdminRole(locals.user?.roles)) {
		error(403, 'Admin role required');
	}
	try {
		const body = await request.json();
		const result = await storeSecret(
			params.nhiId,
			body,
			locals.accessToken,
			locals.tenantId,
			fetch
		);
		return json(result);
	} catch (e) {
		if (e instanceof ApiError) error(e.status, e.message);
		throw e;
	}
};
