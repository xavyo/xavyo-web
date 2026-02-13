import type { PageServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';
import { hasAdminRole } from '$lib/server/auth';
import { listMiningJobs } from '$lib/api/role-mining';
import type { MiningJobListResponse } from '$lib/api/types';

export const load: PageServerLoad = async ({ locals, url, fetch }) => {
	if (!hasAdminRole(locals.user?.roles)) {
		redirect(302, '/dashboard');
	}

	const status = url.searchParams.get('status') || undefined;
	const limit = Number(url.searchParams.get('limit')) || 50;
	const offset = Number(url.searchParams.get('offset')) || 0;

	const jobs = await listMiningJobs(
		{ status, limit, offset },
		locals.accessToken!,
		locals.tenantId!,
		fetch
	).catch((): MiningJobListResponse => ({ items: [], total: 0, page: 1, page_size: 50 }));

	return { jobs };
};
