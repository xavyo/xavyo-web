import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { adminListItems, adminCreateItem } from '$lib/api/catalog';
import { hasAdminRole } from '$lib/server/auth';

export const GET: RequestHandler = async ({ url, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) error(401, 'Unauthorized');
	if (!hasAdminRole(locals.user?.roles)) error(403, 'Forbidden');
	const category_id = url.searchParams.get('category_id') ?? undefined;
	const item_type = url.searchParams.get('item_type') ?? undefined;
	const enabled = url.searchParams.get('enabled') !== null ? url.searchParams.get('enabled') === 'true' : undefined;
	const search = url.searchParams.get('search') ?? undefined;
	const tag = url.searchParams.get('tag') ?? undefined;
	const limit = Number(url.searchParams.get('limit') ?? '50');
	const offset = Number(url.searchParams.get('offset') ?? '0');
	const result = await adminListItems({ category_id, item_type, enabled, search, tag, limit, offset }, locals.accessToken, locals.tenantId, fetch);
	return json(result);
};

export const POST: RequestHandler = async ({ request, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) error(401, 'Unauthorized');
	if (!hasAdminRole(locals.user?.roles)) error(403, 'Forbidden');
	const body = await request.json();
	const result = await adminCreateItem(body, locals.accessToken, locals.tenantId, fetch);
	return json(result, { status: 201 });
};
