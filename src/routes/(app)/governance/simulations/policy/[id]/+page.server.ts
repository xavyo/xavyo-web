import type { PageServerLoad } from './$types';
import { error, isHttpError, redirect } from '@sveltejs/kit';
import {
	getPolicySimulation,
	listPolicySimulationResults,
	checkPolicySimulationStaleness
} from '$lib/api/simulations';
import { ApiError } from '$lib/api/client';
import { hasAdminRole } from '$lib/server/auth';
import type { PolicySimulationResult, StalenessCheck } from '$lib/api/types';

export const load: PageServerLoad = async ({ params, locals, fetch }) => {
	if (!hasAdminRole(locals.user?.roles)) {
		redirect(302, '/dashboard');
	}

	try {
		const [simulation, resultsData, staleness] = await Promise.all([
			getPolicySimulation(params.id, locals.accessToken!, locals.tenantId!, fetch),
			listPolicySimulationResults(
				params.id,
				{ limit: 50, offset: 0 },
				locals.accessToken!,
				locals.tenantId!,
				fetch
			).catch(() => ({ items: [] as PolicySimulationResult[], total: 0, limit: 50, offset: 0 })),
			checkPolicySimulationStaleness(
				params.id,
				locals.accessToken!,
				locals.tenantId!,
				fetch
			).catch((): StalenessCheck => ({
				is_stale: false,
				data_snapshot_at: '',
				last_data_change_at: ''
			}))
		]);

		return { simulation, results: resultsData, staleness };
	} catch (e) {
		if (isHttpError(e)) throw e;
		if (e instanceof ApiError) {
			error(e.status, e.message);
		}
		error(500, 'Failed to load policy simulation');
	}
};
