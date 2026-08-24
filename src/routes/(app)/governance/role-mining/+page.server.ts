import type { PageServerLoad } from './$types';
import { error, redirect } from '@sveltejs/kit';
import { hasAdminRole } from '$lib/server/auth';
import { listMiningJobs } from '$lib/api/role-mining';
import { ApiError } from '$lib/api/client';

export const load: PageServerLoad = async ({ locals, url, fetch }) => {
	if (!hasAdminRole(locals.user?.roles)) {
		redirect(302, '/dashboard');
	}

	const status = url.searchParams.get('status') || undefined;
	const limit = Number(url.searchParams.get('limit')) || 50;
	const offset = Number(url.searchParams.get('offset')) || 0;

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
