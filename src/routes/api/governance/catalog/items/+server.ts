import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { listCatalogItems } from '$lib/api/catalog';
import { listPagination } from '$lib/server/list-pagination';

export const GET: RequestHandler = async ({ url, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) error(401, 'Unauthorized');
	const category_id = url.searchParams.get('category_id') ?? undefined;
	const item_type = url.searchParams.get('item_type') ?? undefined;
	const search = url.searchParams.get('search') ?? undefined;
	const tag = url.searchParams.get('tag') ?? undefined;
	const beneficiary_id = url.searchParams.get('beneficiary_id') ?? undefined;
	const result = await listCatalogItems(
		{ category_id, item_type, search, tag, beneficiary_id, ...listPagination(url) },
		locals.accessToken,
		locals.tenantId,
		fetch
	);
	return json(result);
};
