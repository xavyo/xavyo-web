import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { listSocialConnections } from '$lib/api/social';
import { ApiError } from '$lib/api/client';

export const GET: RequestHandler = async ({ locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) {
		error(401, 'Unauthorized');
	}
	// No admin check - user-level endpoint
	try {
		const result = await listSocialConnections(locals.accessToken, locals.tenantId, fetch);
		return json(result);
	} catch (e) {
		if (e instanceof ApiError) {
			error(e.status, e.message);
		}
		error(500, 'Failed to fetch social connections');
	}
};
