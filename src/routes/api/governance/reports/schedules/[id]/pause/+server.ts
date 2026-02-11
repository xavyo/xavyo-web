import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { pauseSchedule } from '$lib/api/governance-reporting';
import { ApiError } from '$lib/api/client';
import { hasAdminRole } from '$lib/server/auth';

export const POST: RequestHandler = async ({ params, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) error(401, 'Unauthorized');
	if (!hasAdminRole(locals.user?.roles)) error(403, 'Forbidden');

	try {
		const result = await pauseSchedule(params.id, locals.accessToken, locals.tenantId, fetch);
		return json(result);
	} catch (e) {
		if (e instanceof ApiError) error(e.status, e.message);
		throw e;
	}
};
