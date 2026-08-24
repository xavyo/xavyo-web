import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { moveRole } from '$lib/api/governance-roles';
import type { MoveRoleRequest } from '$lib/api/types';

export const POST: RequestHandler = async ({ params, request, locals, fetch }) => {
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
	if (typeof body.version !== 'number') {
		error(400, 'version is required');
	}
	if (body.new_parent_id !== null && typeof body.new_parent_id !== 'string') {
		error(400, 'new_parent_id must be a string or null');
	}
	const data: MoveRoleRequest = {
		new_parent_id: body.new_parent_id as string | null,
		version: body.version
	};
	const result = await moveRole(params.id, data, locals.accessToken, locals.tenantId, fetch);

	return json(result);
};
