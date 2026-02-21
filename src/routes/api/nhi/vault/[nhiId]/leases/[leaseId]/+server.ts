import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { revokeLease } from '$lib/api/nhi-vault';
import { ApiError } from '$lib/api/client';
import { hasAdminRole } from '$lib/server/auth';

export const DELETE: RequestHandler = async ({ params, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) {
		error(401, 'Unauthorized');
	}
	if (!hasAdminRole(locals.user?.roles)) {
		error(403, 'Admin role required');
	}
	try {
		await revokeLease(params.nhiId, params.leaseId, locals.accessToken, locals.tenantId, fetch);
		return json({ ok: true });
	} catch (e) {
		if (e instanceof ApiError) error(e.status, e.message);
		throw e;
	}
};
