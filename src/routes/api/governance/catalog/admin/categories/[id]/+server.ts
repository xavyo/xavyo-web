import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { adminUpdateCategory, adminDeleteCategory } from '$lib/api/catalog';
import { hasAdminRole } from '$lib/server/auth';

export const PUT: RequestHandler = async ({ params, request, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) error(401, 'Unauthorized');
	if (!hasAdminRole(locals.user?.roles)) error(403, 'Forbidden');
	const body = await request.json();
	const result = await adminUpdateCategory(params.id, body, locals.accessToken, locals.tenantId, fetch);
	return json(result);
};

export const DELETE: RequestHandler = async ({ params, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) error(401, 'Unauthorized');
	if (!hasAdminRole(locals.user?.roles)) error(403, 'Forbidden');
	await adminDeleteCategory(params.id, locals.accessToken, locals.tenantId, fetch);
	return new Response(null, { status: 204 });
};
