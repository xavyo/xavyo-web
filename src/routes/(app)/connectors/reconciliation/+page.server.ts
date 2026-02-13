import type { PageServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';
import { hasAdminRole } from '$lib/server/auth';
import { listAllSchedules, getDiscrepancyTrend } from '$lib/api/reconciliation';

export const load: PageServerLoad = async ({ locals, fetch }) => {
	if (!hasAdminRole(locals.user?.roles)) redirect(302, '/dashboard');

	try {
		const [schedules, trend] = await Promise.all([
			listAllSchedules(locals.accessToken!, locals.tenantId!, fetch),
			getDiscrepancyTrend({}, locals.accessToken!, locals.tenantId!, fetch).catch(() => null)
		]);
		return { schedules: schedules.schedules, trend };
	} catch {
		return { schedules: [], trend: null };
	}
};
