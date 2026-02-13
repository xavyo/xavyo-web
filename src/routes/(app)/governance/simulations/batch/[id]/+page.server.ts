import type { PageServerLoad } from './$types';
import { error, isHttpError, redirect } from '@sveltejs/kit';
import { getBatchSimulation, listBatchSimulationResults } from '$lib/api/simulations';
import { ApiError } from '$lib/api/client';
import { hasAdminRole } from '$lib/server/auth';
import type { BatchSimulationResult } from '$lib/api/types';

export const load: PageServerLoad = async ({ params, locals, fetch }) => {
	if (!hasAdminRole(locals.user?.roles)) {
		redirect(302, '/dashboard');
	}

	try {
		const [simulation, resultsData] = await Promise.all([
			getBatchSimulation(params.id, locals.accessToken!, locals.tenantId!, fetch),
			listBatchSimulationResults(
				params.id,
				{ limit: 50, offset: 0 },
				locals.accessToken!,
				locals.tenantId!,
				fetch
			).catch(() => ({ items: [] as BatchSimulationResult[], total: 0, limit: 50, offset: 0 }))
		]);

		return { simulation, results: resultsData };
	} catch (e) {
		if (isHttpError(e)) throw e;
		if (e instanceof ApiError) {
			error(e.status, e.message);
		}
		error(500, 'Failed to load batch simulation');
	}
};
