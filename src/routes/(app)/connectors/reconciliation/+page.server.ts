import type { PageServerLoad } from './$types';
import { error, redirect } from '@sveltejs/kit';
import { hasAdminRole } from '$lib/server/auth';
import { listAllSchedules, getDiscrepancyTrend } from '$lib/api/reconciliation';
import { ApiError } from '$lib/api/client';

export const load: PageServerLoad = async ({ locals, fetch }) => {
	if (!hasAdminRole(locals.user?.roles)) redirect(302, '/dashboard');

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
