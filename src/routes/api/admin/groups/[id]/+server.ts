import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getGroup, updateGroup, deleteGroup } from '$lib/api/groups';
import type { UpdateUserGroupRequest } from '$lib/api/types';

export const GET: RequestHandler = async ({ params, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) {
		error(401, 'Unauthorized');
	}

	const result = await getGroup(params.id, locals.accessToken, locals.tenantId, fetch);

	return json(result);
};

export const PUT: RequestHandler = async ({ params, request, locals, fetch }) => {
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
	const data: UpdateUserGroupRequest = {};
	const displayName = body.display_name !== undefined ? body.display_name : body.name;
	if (displayName !== undefined) {
		if (typeof displayName !== 'string' || displayName.length === 0) {
			error(400, 'display_name must be a non-empty string');
		}
		data.display_name = displayName;
	}
	if (body.description !== undefined) {
		if (typeof body.description !== 'string') {
			error(400, 'description must be a string');
		}
		data.description = body.description;
	}
	const result = await updateGroup(params.id, data, locals.accessToken, locals.tenantId, fetch);

	return json(result);
};

export const DELETE: RequestHandler = async ({ params, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) {
		error(401, 'Unauthorized');
	}

	await deleteGroup(params.id, locals.accessToken, locals.tenantId, fetch);

	return new Response(null, { status: 204 });
};
