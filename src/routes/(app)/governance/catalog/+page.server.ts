import type { PageServerLoad } from './$types';
import { listCategories, listCatalogItems, getCart } from '$lib/api/catalog';
import { error } from '@sveltejs/kit';
import { ApiError } from '$lib/api/client';

export const load: PageServerLoad = async ({ locals, fetch, url }) => {
	if (!locals.accessToken || !locals.tenantId) error(401, 'Unauthorized');

	const category_id = url.searchParams.get('category_id') ?? undefined;
	const item_type = url.searchParams.get('item_type') ?? undefined;
	const search = url.searchParams.get('search') ?? undefined;

	try {
		const [categories, items, cart] = await Promise.all([
			listCategories({ limit: 100, offset: 0 }, locals.accessToken, locals.tenantId, fetch),
			listCatalogItems(
				{ category_id, item_type, search, limit: 50, offset: 0 },
				locals.accessToken,
				locals.tenantId,
				fetch
			),
			getCart(undefined, locals.accessToken, locals.tenantId, fetch)
		]);

		return {
			categories: categories.items,
			items: items.items,
			itemsTotal: items.total,
			cartItemCount: cart?.item_count ?? 0,
			filters: { category_id, item_type, search }
		};
	} catch (e) {
		if (e instanceof ApiError) error(e.status, e.message);
		error(500, 'Failed to load catalog');
	}
};
