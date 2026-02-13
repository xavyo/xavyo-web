import type { PageServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';
import { hasAdminRole } from '$lib/server/auth';
import { getManualTaskDashboard, listManualTasks } from '$lib/api/manual-tasks';

export const load: PageServerLoad = async ({ url, locals, fetch }) => {
	if (!hasAdminRole(locals.user?.roles)) {
		redirect(302, '/dashboard');
	}

	const status = url.searchParams.get('status') ?? undefined;
	const application_id = url.searchParams.get('application_id') ?? undefined;
	const user_id = url.searchParams.get('user_id') ?? undefined;
	const sla_breached = url.searchParams.get('sla_breached') === 'true' ? true : url.searchParams.get('sla_breached') === 'false' ? false : undefined;
	const assignee_id = url.searchParams.get('assignee_id') ?? undefined;
	const limit = Number(url.searchParams.get('limit') ?? '20');
	const offset = Number(url.searchParams.get('offset') ?? '0');

	const [dashboard, tasks] = await Promise.all([
		getManualTaskDashboard(locals.accessToken!, locals.tenantId!, fetch).catch(() => ({
			pending_count: 0,
			in_progress_count: 0,
			sla_at_risk_count: 0,
			sla_breached_count: 0,
			completed_today: 0,
			average_completion_time_seconds: null
		})),
		listManualTasks(
			{ status, application_id, user_id, sla_breached, assignee_id, limit, offset },
			locals.accessToken!, locals.tenantId!, fetch
		).catch(() => ({ items: [], total: 0, limit, offset }))
	]);

	return { dashboard, tasks, filters: { status, application_id, user_id, sla_breached, assignee_id } };
};
