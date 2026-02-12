import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { analyzeImpact } from '$lib/api/birthright';
import { hasAdminRole } from '$lib/server/auth';

export const POST: RequestHandler = async ({ params, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) error(401, 'Unauthorized');
	if (!hasAdminRole(locals.user?.roles)) error(403, 'Forbidden');
	const result = await analyzeImpact(params.id, locals.accessToken, locals.tenantId, fetch);
	return json(result);
};
