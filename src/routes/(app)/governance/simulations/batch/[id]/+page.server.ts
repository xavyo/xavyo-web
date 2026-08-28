import type { PageServerLoad } from './$types';
import { error, isHttpError } from '@sveltejs/kit';
import { getBatchSimulation, listBatchSimulationResults } from '$lib/api/simulations';
import { ApiError } from '$lib/api/client';


export const load: PageServerLoad = async ({ params, locals, fetch }) => {

	try {
		const [simulation, resultsData] = await Promise.all([
			getBatchSimulation(params.id, locals.accessToken!, locals.tenantId!, fetch),
			listBatchSimulationResults(
				params.id,
				{ limit: 50, offset: 0 },
				locals.accessToken!,
				locals.tenantId!,
				fetch
			)
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
