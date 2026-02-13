import type { PageServerLoad } from './$types';
import { redirect, error } from '@sveltejs/kit';
import { hasAdminRole } from '$lib/server/auth';
import { getMiningJob, listCandidates } from '$lib/api/role-mining';

export const load: PageServerLoad = async ({ params, locals, fetch }) => {
	if (!hasAdminRole(locals.user?.roles)) {
		redirect(302, '/');
	}
	if (!locals.accessToken || !locals.tenantId) {
		redirect(302, '/login');
	}

	try {
		const job = await getMiningJob(params.id, locals.accessToken, locals.tenantId, fetch);

		let candidates = { items: [] as Awaited<ReturnType<typeof listCandidates>>['items'], total: 0, page: 1, page_size: 50 };
		if (job.status === 'completed') {
			candidates = await listCandidates(
				params.id,
				{ limit: 50, offset: 0 },
				locals.accessToken,
				locals.tenantId,
				fetch
			).catch(() => ({ items: [], total: 0, page: 1, page_size: 50 }));
		}

		return { job, candidates };
	} catch {
		error(404, 'Mining job not found');
	}
};
