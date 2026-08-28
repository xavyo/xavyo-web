import type { PageServerLoad } from './$types';
import { listBirthrightPolicies } from '$lib/api/birthright';
import { error } from '@sveltejs/kit';
import { listPagination } from '$lib/server/list-pagination';

export const load: PageServerLoad = async ({ locals, fetch, url }) => {
	if (!locals.accessToken || !locals.tenantId) error(401, 'Unauthorized');

	const status = url.searchParams.get('status') ?? undefined;
	const { limit = 50, offset = 0 } = listPagination(url);

	const result = await listBirthrightPolicies({ status, limit, offset }, locals.accessToken, locals.tenantId, fetch);
	return { policies: result.items, total: result.total, filters: { status } };
};
