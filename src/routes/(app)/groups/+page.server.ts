import type { PageServerLoad } from './$types';
import { listGroups } from '$lib/api/groups';
import { ApiError } from '$lib/api/client';
import { error } from '@sveltejs/kit';
import { listPagination } from '$lib/server/list-pagination';

export const load: PageServerLoad = async ({ url, locals, fetch }) => {
	const { limit = 20, offset = 0 } = listPagination(url);

	try {
		const result = await listGroups({ limit, offset }, locals.accessToken!, locals.tenantId!, fetch);
		return { groups: result.groups, pagination: result.pagination };
	} catch (e) {
		if (e instanceof ApiError) error(e.status, e.message);
		error(500, 'Failed to load groups');
	}
};
