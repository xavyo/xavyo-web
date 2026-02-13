import type { PageServerLoad } from './$types';
import { listCategories, listCatalogItems, getCart } from '$lib/api/catalog';
import { error } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ locals, fetch, url }) => {
	if (!locals.accessToken || !locals.tenantId) error(401, 'Unauthorized');

	const category_id = url.searchParams.get('category_id') ?? undefined;
	const item_type = url.searchParams.get('item_type') ?? undefined;
	const search = url.searchParams.get('search') ?? undefined;

	const [categoriesRes, itemsRes, cartRes] = await Promise.allSettled([
		listCategories({ limit: 100, offset: 0 }, locals.accessToken, locals.tenantId, fetch),
		listCatalogItems({ category_id, item_type, search, limit: 50, offset: 0 }, locals.accessToken, locals.tenantId, fetch),
		getCart(undefined, locals.accessToken, locals.tenantId, fetch)
	]);

	return {
		categories: categoriesRes.status === 'fulfilled' ? categoriesRes.value.items : [],
		items: itemsRes.status === 'fulfilled' ? itemsRes.value.items : [],
		itemsTotal: itemsRes.status === 'fulfilled' ? itemsRes.value.total : 0,
		cartItemCount: cartRes.status === 'fulfilled' ? (cartRes.value?.item_count ?? 0) : 0,
		filters: { category_id, item_type, search }
	};
};
