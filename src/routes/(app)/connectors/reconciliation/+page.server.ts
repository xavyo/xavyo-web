import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';
import { listAllSchedules, getDiscrepancyTrend } from '$lib/api/reconciliation';
import { ApiError } from '$lib/api/client';

export const load: PageServerLoad = async ({ locals, fetch }) => {

	try {
		const [schedules, trend] = await Promise.all([
			listAllSchedules(locals.accessToken!, locals.tenantId!, fetch),
			getDiscrepancyTrend({}, locals.accessToken!, locals.tenantId!, fetch)
		]);
		return { schedules: schedules.schedules, trend };
	} catch (e) {
		if (e instanceof ApiError) error(e.status, e.message);
		error(500, 'Failed to load reconciliation');
	}
};
