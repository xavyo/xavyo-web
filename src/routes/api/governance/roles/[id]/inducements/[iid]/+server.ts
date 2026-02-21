import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getRoleInducement, deleteRoleInducement } from '$lib/api/governance-roles';
import { hasAdminRole } from '$lib/server/auth';

export const GET: RequestHandler = async ({ params, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) error(401, 'Unauthorized');
	if (!hasAdminRole(locals.user?.roles)) error(403, 'Forbidden');

	const result = await getRoleInducement(params.id, params.iid, locals.accessToken, locals.tenantId, fetch);
	return json(result);
};

export const DELETE: RequestHandler = async ({ params, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) error(401, 'Unauthorized');
	if (!hasAdminRole(locals.user?.roles)) error(403, 'Forbidden');

	await deleteRoleInducement(params.id, params.iid, locals.accessToken, locals.tenantId, fetch);
	return new Response(null, { status: 204 });
};
