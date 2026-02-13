import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getMicroCertificationStats } from '$lib/api/micro-certifications';
import { hasAdminRole } from '$lib/server/auth';

export const GET: RequestHandler = async ({ locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) error(401, 'Unauthorized');
	if (!hasAdminRole(locals.user?.roles)) error(403, 'Admin access required');

	const result = await getMicroCertificationStats(locals.accessToken, locals.tenantId, fetch);
	return json(result);
};
