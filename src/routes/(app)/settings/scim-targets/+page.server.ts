import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';
import { listScimTargets } from '$lib/api/scim-targets';
import { ApiError } from '$lib/api/client';
import { listPagination } from '$lib/server/list-pagination';

export const load: PageServerLoad = async ({ url, locals, fetch }) => {
	const status = url.searchParams.get('status') ?? undefined;
	const { limit = 20, offset = 0 } = listPagination(url);

	try {
		const result = await listScimTargets(
			{ status, limit, offset },
			locals.accessToken!,
			locals.tenantId!,
			fetch
		);
		return { targets: result };
	} catch (e) {
		if (e instanceof ApiError) error(e.status, e.message);
		error(500, 'Failed to load SCIM targets');
	}
};
