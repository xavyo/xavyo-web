import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { listRoleInducements, createRoleInducement } from '$lib/api/governance-roles';
import { hasAdminRole } from '$lib/server/auth';

export const GET: RequestHandler = async ({ params, url, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) error(401, 'Unauthorized');
	if (!hasAdminRole(locals.user?.roles)) error(403, 'Forbidden');

	const enabled_only = url.searchParams.get('enabled_only') === 'true';
	const limit = Number(url.searchParams.get('limit') ?? '20');
	const offset = Number(url.searchParams.get('offset') ?? '0');

	const result = await listRoleInducements(params.id, { enabled_only, limit, offset }, locals.accessToken, locals.tenantId, fetch);
	return json(result);
};

export const POST: RequestHandler = async ({ params, request, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) error(401, 'Unauthorized');
	if (!hasAdminRole(locals.user?.roles)) error(403, 'Forbidden');

	const body = await request.json();
	const result = await createRoleInducement(params.id, body, locals.accessToken, locals.tenantId, fetch);
	return json(result, { status: 201 });
};
