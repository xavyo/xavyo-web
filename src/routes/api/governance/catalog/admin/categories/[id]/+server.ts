import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { adminUpdateCategory, adminDeleteCategory } from '$lib/api/catalog';
import { hasAdminRole } from '$lib/server/auth';
import type { UpdateCategoryRequest } from '$lib/api/types';

export const PUT: RequestHandler = async ({ params, request, locals, fetch }) => {
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
	const data: UpdateCategoryRequest = {};
	if (body.name !== undefined) {
		if (typeof body.name !== 'string' || body.name.length === 0) {
			error(400, 'name must be a non-empty string');
		}
		data.name = body.name;
	}
	if (body.description !== undefined) {
		if (typeof body.description !== 'string') {
			error(400, 'description must be a string');
		}
		data.description = body.description;
	}
	if (body.parent_id !== undefined) {
		if (body.parent_id !== null && typeof body.parent_id !== 'string') {
			error(400, 'parent_id must be a string or null');
		}
		data.parent_id = body.parent_id as string | null;
	}
	if (body.icon !== undefined) {
		if (body.icon !== null && typeof body.icon !== 'string') {
			error(400, 'icon must be a string or null');
		}
		data.icon = body.icon as string | null;
	}
	if (body.display_order !== undefined) {
		if (typeof body.display_order !== 'number') {
			error(400, 'display_order must be a number');
		}
		data.display_order = body.display_order;
	}
	const result = await adminUpdateCategory(params.id, data, locals.accessToken, locals.tenantId, fetch);
	return json(result);
};

export const DELETE: RequestHandler = async ({ params, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) error(401, 'Unauthorized');
	if (!hasAdminRole(locals.user?.roles)) error(403, 'Forbidden');
	await adminDeleteCategory(params.id, locals.accessToken, locals.tenantId, fetch);
	return new Response(null, { status: 204 });
};
