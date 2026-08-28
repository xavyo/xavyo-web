import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';
import { listMiningJobs } from '$lib/api/role-mining';
import { ApiError } from '$lib/api/client';
import { listPagination } from '$lib/server/list-pagination';

export const load: PageServerLoad = async ({ locals, url, fetch }) => {

	const status = url.searchParams.get('status') || undefined;
	const { limit = 50, offset = 0 } = listPagination(url);

	try {
		const jobs = await listMiningJobs(
			{ status, limit, offset },
			locals.accessToken!,
			locals.tenantId!,
			fetch
		);
		return { jobs };
	} catch (e) {
		if (e instanceof ApiError) error(e.status, e.message);
		error(500, 'Failed to load role mining jobs');
	}
};
