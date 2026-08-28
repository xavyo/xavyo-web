import type { PageServerLoad } from './$types';
import { redirect, error } from '@sveltejs/kit';
import { getMiningJob, listCandidates } from '$lib/api/role-mining';
import { ApiError } from '$lib/api/client';

export const load: PageServerLoad = async ({ params, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) {
		redirect(302, '/login');
	}

	try {
		const job = await getMiningJob(params.id, locals.accessToken, locals.tenantId, fetch);

		let candidates = {
			items: [] as Awaited<ReturnType<typeof listCandidates>>['items'],
			total: 0,
			page: 1,
			page_size: 50
		};
		if (job.status === 'completed') {
			candidates = await listCandidates(
				params.id,
				{ limit: 50, offset: 0 },
				locals.accessToken,
				locals.tenantId,
				fetch
			);
		}

		return { job, candidates };
	} catch (e) {
		if (e instanceof ApiError) error(e.status, e.message);
		error(500, 'Failed to load mining job');
	}
};
