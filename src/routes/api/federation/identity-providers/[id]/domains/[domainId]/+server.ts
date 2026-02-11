import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { hasAdminRole } from '$lib/server/auth';
import { removeDomain } from '$lib/api/federation';

export const DELETE: RequestHandler = async ({ params, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) {
		error(401, 'Unauthorized');
	}
	if (!hasAdminRole(locals.user?.roles)) {
		error(403, 'Forbidden');
	}

	await removeDomain(params.id, params.domainId, locals.accessToken, locals.tenantId, fetch);
	return new Response(null, { status: 204 });
};
