import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { listRoles, createRole } from '$lib/api/governance-roles';
import type { CreateGovernanceRoleRequest } from '$lib/api/types';
import { listPagination } from '$lib/server/list-pagination';

export const GET: RequestHandler = async ({ url, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) {
		error(401, 'Unauthorized');
	}

	const result = await listRoles(listPagination(url), locals.accessToken, locals.tenantId, fetch);

	return json(result);
};

export const POST: RequestHandler = async ({ request, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) {
		error(401, 'Unauthorized');
	}

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
	if (typeof body.name !== 'string' || body.name.length === 0) {
		error(400, 'name is required');
	}
	const data: CreateGovernanceRoleRequest = { name: body.name };
	if (body.description !== undefined) {
		if (typeof body.description !== 'string') {
			error(400, 'description must be a string');
		}
		data.description = body.description;
	}
	if (body.parent_role_id !== undefined) {
		if (typeof body.parent_role_id !== 'string') {
			error(400, 'parent_role_id must be a string');
		}
		data.parent_role_id = body.parent_role_id;
	}
	if (body.application_id !== undefined) {
		if (typeof body.application_id !== 'string') {
			error(400, 'application_id must be a string');
		}
		data.application_id = body.application_id;
	}
	const result = await createRole(data, locals.accessToken, locals.tenantId, fetch);

	return json(result, { status: 201 });
};
