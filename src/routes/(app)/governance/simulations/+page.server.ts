import type { PageServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';
import { listPolicySimulations, listBatchSimulations, listSimulationComparisons } from '$lib/api/simulations';
import { hasAdminRole } from '$lib/server/auth';
import type { PolicySimulation, BatchSimulation, SimulationComparison } from '$lib/api/types';

export const load: PageServerLoad = async ({ locals, fetch }) => {
	if (!hasAdminRole(locals.user?.roles)) {
		redirect(302, '/dashboard');
	}

	const [policySimulations, batchSimulations, comparisons] = await Promise.all([
		listPolicySimulations(
			{ limit: 20, offset: 0 },
			locals.accessToken!,
			locals.tenantId!,
			fetch
		).catch(() => ({ items: [] as PolicySimulation[], total: 0, limit: 20, offset: 0 })),
		listBatchSimulations(
			{ limit: 20, offset: 0 },
			locals.accessToken!,
			locals.tenantId!,
			fetch
		).catch(() => ({ items: [] as BatchSimulation[], total: 0, limit: 20, offset: 0 })),
		listSimulationComparisons(
			{ limit: 20, offset: 0 },
			locals.accessToken!,
			locals.tenantId!,
			fetch
		).catch(() => ({ items: [] as SimulationComparison[], total: 0, limit: 20, offset: 0 }))
	]);

	return { policySimulations, batchSimulations, comparisons };
};
