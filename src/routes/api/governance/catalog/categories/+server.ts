import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { listCategories } from '$lib/api/catalog';
import { listPagination } from '$lib/server/list-pagination';

export const GET: RequestHandler = async ({ url, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) error(401, 'Unauthorized');
	const parent_id = url.searchParams.get('parent_id') ?? undefined;
	const result = await listCategories(
		{ parent_id, ...listPagination(url) },
		locals.accessToken,
		locals.tenantId,
		fetch
	);
	return json(result);
};
