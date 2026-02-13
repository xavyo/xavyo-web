import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { hasAdminRole } from '$lib/server/auth';
import { triggerCorrelation } from '$lib/api/correlation';

export const POST: RequestHandler = async ({ params, request, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) error(401, 'Unauthorized');
	if (!hasAdminRole(locals.user?.roles)) error(403, 'Forbidden');
	const text = await request.text();
	const body = text ? JSON.parse(text) : undefined;
	const result = await triggerCorrelation(params.connectorId, body, locals.accessToken, locals.tenantId, fetch);
	return json(result, { status: 202 });
};
