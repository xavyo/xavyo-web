import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { adminListCategories, adminCreateCategory } from '$lib/api/catalog';
import { hasAdminRole } from '$lib/server/auth';

export const GET: RequestHandler = async ({ url, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) error(401, 'Unauthorized');
	if (!hasAdminRole(locals.user?.roles)) error(403, 'Forbidden');
	const limit = Number(url.searchParams.get('limit') ?? '50');
	const offset = Number(url.searchParams.get('offset') ?? '0');
	const parent_id = url.searchParams.get('parent_id') ?? undefined;
	const result = await adminListCategories({ limit, offset, parent_id }, locals.accessToken, locals.tenantId, fetch);
	return json(result);
};

export const POST: RequestHandler = async ({ request, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) error(401, 'Unauthorized');
	if (!hasAdminRole(locals.user?.roles)) error(403, 'Forbidden');
	const body = await request.json();
	const result = await adminCreateCategory(body, locals.accessToken, locals.tenantId, fetch);
	return json(result, { status: 201 });
};
