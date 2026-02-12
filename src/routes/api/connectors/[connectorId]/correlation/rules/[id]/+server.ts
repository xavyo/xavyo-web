import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { hasAdminRole } from '$lib/server/auth';
import { getCorrelationRule, updateCorrelationRule, deleteCorrelationRule } from '$lib/api/correlation';

export const GET: RequestHandler = async ({ params, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) error(401, 'Unauthorized');
	const result = await getCorrelationRule(params.connectorId, params.id, locals.accessToken, locals.tenantId, fetch);
	return json(result);
};

export const PATCH: RequestHandler = async ({ params, request, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) error(401, 'Unauthorized');
	if (!hasAdminRole(locals.user?.roles)) error(403, 'Forbidden');
	const body = await request.json();
	const result = await updateCorrelationRule(params.connectorId, params.id, body, locals.accessToken, locals.tenantId, fetch);
	return json(result);
};

export const DELETE: RequestHandler = async ({ params, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) error(401, 'Unauthorized');
	if (!hasAdminRole(locals.user?.roles)) error(403, 'Forbidden');
	await deleteCorrelationRule(params.connectorId, params.id, locals.accessToken, locals.tenantId, fetch);
	return new Response(null, { status: 204 });
};
