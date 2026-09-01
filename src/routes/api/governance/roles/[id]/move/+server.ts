import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { moveRole } from '$lib/api/governance-roles';
import type { MoveRoleRequest } from '$lib/api/types';
import { JsonObjectError, parseBoundedInteger } from '$lib/utils/json-record';

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
	let version: number;
	try {
		version = parseBoundedInteger(body.version, 0, 1_000_000, 'version');
	} catch (e) {
		if (e instanceof JsonObjectError) error(400, e.message);
		throw e;
	}
	if (body.new_parent_id !== null && typeof body.new_parent_id !== 'string') {
		error(400, 'new_parent_id must be a string or null');
	}
	const data: MoveRoleRequest = {
		new_parent_id: body.new_parent_id as string | null,
		version
	};
	const result = await moveRole(params.id, data, locals.accessToken, locals.tenantId, fetch);

	return json(result);
};
