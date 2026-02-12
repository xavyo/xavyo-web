import type { PageServerLoad } from './$types';
import { listGroups } from '$lib/api/groups';
import { ApiError } from '$lib/api/client';
import { error } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ url, locals, fetch }) => {
	const limit = Number(url.searchParams.get('limit') ?? '20');
	const offset = Number(url.searchParams.get('offset') ?? '0');

	try {
		const result = await listGroups({ limit, offset }, locals.accessToken!, locals.tenantId!, fetch);
		return { groups: result.groups, pagination: result.pagination };
	} catch (e) {
		if (e instanceof ApiError) error(e.status, e.message);
		error(500, 'Failed to load groups');
	}
};
