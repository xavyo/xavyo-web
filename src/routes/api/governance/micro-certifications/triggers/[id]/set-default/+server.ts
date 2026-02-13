import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { setDefaultTriggerRule } from '$lib/api/micro-certifications';
import { hasAdminRole } from '$lib/server/auth';

export const POST: RequestHandler = async ({ params, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) error(401, 'Unauthorized');
	if (!hasAdminRole(locals.user?.roles)) error(403, 'Admin access required');

	const result = await setDefaultTriggerRule(params.id, locals.accessToken, locals.tenantId, fetch);
	return json(result);
};
