import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';
import { listPolicySimulations, listBatchSimulations, listSimulationComparisons } from '$lib/api/simulations';
import { ApiError } from '$lib/api/client';

export const load: PageServerLoad = async ({ locals, fetch }) => {

	try {
		const [policySimulations, batchSimulations, comparisons] = await Promise.all([
			listPolicySimulations(
				{ limit: 20, offset: 0 },
				locals.accessToken!,
				locals.tenantId!,
				fetch
			),
			listBatchSimulations(
				{ limit: 20, offset: 0 },
				locals.accessToken!,
				locals.tenantId!,
				fetch
			),
			listSimulationComparisons(
				{ limit: 20, offset: 0 },
				locals.accessToken!,
				locals.tenantId!,
				fetch
			)
		]);
		return { policySimulations, batchSimulations, comparisons };
	} catch (e) {
		if (e instanceof ApiError) error(e.status, e.message);
		error(500, 'Failed to load simulations');
	}
};
