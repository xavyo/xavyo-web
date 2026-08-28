import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';
import { listMyCertifications } from '$lib/api/my-certifications';
import { ApiError } from '$lib/api/client';
import { listPagination } from '$lib/server/list-pagination';

export const load: PageServerLoad = async ({ locals, fetch, url }) => {
	if (!locals.accessToken || !locals.tenantId) error(401, 'Unauthorized');

	const status = url.searchParams.get('status') ?? 'pending';
	const { limit = 20, offset = 0 } = listPagination(url);
	const page_size = limit;
	const page = Math.floor(offset / page_size) + 1;

	try {
		const result = await listMyCertifications(
			{ status: status || undefined, page, page_size },
			locals.accessToken,
			locals.tenantId,
			fetch
		);
		return {
			items: result.items,
			total: result.total,
			status,
			page,
			page_size
		};
	} catch (e) {
		if (e instanceof ApiError && e.status === 403) error(403, 'Forbidden');
		if (e instanceof ApiError && e.status === 401) error(401, 'Unauthorized');
		error(502, 'Failed to load certifications');
	}
};
