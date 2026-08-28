import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';
import { listConflicts } from '$lib/api/operations';
import { ApiError } from '$lib/api/client';
import { listPagination } from '$lib/server/list-pagination';

export const load: PageServerLoad = async ({ url, locals, fetch }) => {

	const conflict_type = url.searchParams.get('conflict_type') ?? undefined;
	const pending_only = url.searchParams.get('pending_only') === 'true' ? true : undefined;
	const { limit = 20, offset = 0 } = listPagination(url);

	try {
		const result = await listConflicts(
			{ conflict_type, pending_only, limit, offset },
			locals.accessToken!,
			locals.tenantId!,
			fetch
		);
		return { conflicts: result };
	} catch (e) {
		if (e instanceof ApiError) error(e.status, e.message);
		error(500, 'Failed to load conflicts');
	}
};
