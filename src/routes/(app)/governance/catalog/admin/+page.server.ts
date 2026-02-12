import type { PageServerLoad } from './$types';
import { adminListCategories, adminListItems } from '$lib/api/catalog';
import { hasAdminRole } from '$lib/server/auth';
import { error } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) error(401, 'Unauthorized');
	if (!hasAdminRole(locals.user?.roles)) error(403, 'Forbidden');

	const [categoriesRes, itemsRes] = await Promise.all([
		adminListCategories({ limit: 100, offset: 0 }, locals.accessToken, locals.tenantId, fetch),
		adminListItems({ limit: 50, offset: 0 }, locals.accessToken, locals.tenantId, fetch)
	]);

	return {
		categories: categoriesRes.items,
		categoriesTotal: categoriesRes.total,
		items: itemsRes.items,
		itemsTotal: itemsRes.total
	};
};
