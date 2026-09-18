import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getAvailableSocialProviders } from '$lib/api/social';
import { ApiError } from '$lib/api/client';

// User-level endpoint (no admin check): lists the tenant's *enabled* social
// providers so a signed-in user can link/unlink their own accounts. Backed by
// the public `/auth/social/available` endpoint, not the admin
// `/admin/social-providers` list (which 500s "Admin role required" for non-admins).
export const GET: RequestHandler = async ({ locals, fetch }) => {
	if (!locals.tenantId) {
		error(401, 'Unauthorized');
	}
	try {
		const result = await getAvailableSocialProviders(locals.tenantId, fetch);
		return json(result);
	} catch (e) {
		if (e instanceof ApiError) {
			error(e.status, e.message);
		}
		error(500, 'Failed to fetch available social providers');
	}
};
