import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';
import { listMyApprovals } from '$lib/api/my-approvals';
import { ApiError } from '$lib/api/client';
import { listPagination } from '$lib/server/list-pagination';

export const load: PageServerLoad = async ({ locals, fetch, url }) => {
	if (!locals.accessToken || !locals.tenantId) error(401, 'Unauthorized');

	const status = url.searchParams.get('status') ?? 'pending';
	const { limit = 20, offset = 0 } = listPagination(url);

	try {
		const result = await listMyApprovals(
			{ status: status || undefined, limit, offset },
			locals.accessToken,
			locals.tenantId,
			fetch
		);
		return {
			items: result.items,
			total: result.total,
			status,
			limit,
			offset
		};
	} catch (e) {
		if (e instanceof ApiError && e.status === 403) error(403, 'Forbidden');
		if (e instanceof ApiError && e.status === 401) error(401, 'Unauthorized');
		error(502, 'Failed to load approvals');
	}
};
