import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { listCategories } from '$lib/api/catalog';

export const GET: RequestHandler = async ({ url, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) error(401, 'Unauthorized');
	const limit = Number(url.searchParams.get('limit') ?? '50');
	const offset = Number(url.searchParams.get('offset') ?? '0');
	const parent_id = url.searchParams.get('parent_id') ?? undefined;
	const result = await listCategories({ limit, offset, parent_id }, locals.accessToken, locals.tenantId, fetch);
	return json(result);
};
