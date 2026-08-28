import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { listRoleInducements, createRoleInducement } from '$lib/api/governance-roles';
import { hasAdminRole } from '$lib/server/auth';
import type { CreateRoleInducementRequest } from '$lib/api/types';
import { listPagination } from '$lib/server/list-pagination';

export const GET: RequestHandler = async ({ params, url, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) error(401, 'Unauthorized');

	const enabled_only = url.searchParams.get('enabled_only') === 'true';

	const result = await listRoleInducements(
		params.id,
		{ enabled_only, ...listPagination(url) },
		locals.accessToken,
		locals.tenantId,
		fetch
	);
	return json(result);
};

export const POST: RequestHandler = async ({ params, request, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) error(401, 'Unauthorized');
	if (!hasAdminRole(locals.user?.roles)) error(403, 'Forbidden');

	let parsed: unknown;
	try {
		parsed = await request.json();
	} catch {
		error(400, 'Invalid JSON body');
	}
	if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
		error(400, 'Invalid JSON body');
	}
	const body = parsed as Record<string, unknown>;
	if (typeof body.induced_role_id !== 'string' || body.induced_role_id.length === 0) {
		error(400, 'induced_role_id is required');
	}
	const data: CreateRoleInducementRequest = { induced_role_id: body.induced_role_id };
	if (body.description !== undefined) {
		if (typeof body.description !== 'string') {
			error(400, 'description must be a string');
		}
		data.description = body.description;
	}
	const result = await createRoleInducement(
		params.id,
		data,
		locals.accessToken,
		locals.tenantId,
		fetch
	);
	return json(result, { status: 201 });
};
