import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { adminListCategories, adminCreateCategory } from '$lib/api/catalog';
import { hasAdminRole } from '$lib/server/auth';
import type { CreateCategoryRequest } from '$lib/api/types';
import { listPagination } from '$lib/server/list-pagination';

export const GET: RequestHandler = async ({ url, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) error(401, 'Unauthorized');
	if (!hasAdminRole(locals.user?.roles)) error(403, 'Forbidden');
	const parent_id = url.searchParams.get('parent_id') ?? undefined;
	const result = await adminListCategories({ ...listPagination(url), parent_id }, locals.accessToken, locals.tenantId, fetch);
	return json(result);
};

export const POST: RequestHandler = async ({ request, locals, fetch }) => {
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
	if (typeof body.name !== 'string' || body.name.length === 0) {
		error(400, 'name is required');
	}
	const data: CreateCategoryRequest = { name: body.name };
	if (body.description !== undefined) {
		if (typeof body.description !== 'string') {
			error(400, 'description must be a string');
		}
		data.description = body.description;
	}
	if (body.parent_id !== undefined) {
		if (typeof body.parent_id !== 'string') {
			error(400, 'parent_id must be a string');
		}
		data.parent_id = body.parent_id;
	}
	if (body.icon !== undefined) {
		if (typeof body.icon !== 'string') {
			error(400, 'icon must be a string');
		}
		data.icon = body.icon;
	}
	if (body.display_order !== undefined) {
		if (typeof body.display_order !== 'number') {
			error(400, 'display_order must be a number');
		}
		data.display_order = body.display_order;
	}
	const result = await adminCreateCategory(data, locals.accessToken, locals.tenantId, fetch);
	return json(result, { status: 201 });
};
