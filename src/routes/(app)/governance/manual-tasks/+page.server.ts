import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';
import { getManualTaskDashboard, listManualTasks } from '$lib/api/manual-tasks';
import { ApiError } from '$lib/api/client';
import { listPagination } from '$lib/server/list-pagination';

export const load: PageServerLoad = async ({ url, locals, fetch }) => {
	const status = url.searchParams.get('status') ?? undefined;
	const application_id = url.searchParams.get('application_id') ?? undefined;
	const user_id = url.searchParams.get('user_id') ?? undefined;
	const sla_breached = url.searchParams.get('sla_breached') === 'true' ? true : url.searchParams.get('sla_breached') === 'false' ? false : undefined;
	const assignee_id = url.searchParams.get('assignee_id') ?? undefined;
	const operation = url.searchParams.get('operation') ?? undefined;
	const { limit = 20, offset = 0 } = listPagination(url);

	try {
		const [dashboard, tasks] = await Promise.all([
			getManualTaskDashboard(locals.accessToken!, locals.tenantId!, fetch),
			listManualTasks(
				{ status, application_id, user_id, sla_breached, assignee_id, operation, limit, offset },
				locals.accessToken!,
				locals.tenantId!,
				fetch
			)
		]);
		return { dashboard, tasks, filters: { status, application_id, user_id, sla_breached, assignee_id, operation } };
	} catch (e) {
		if (e instanceof ApiError) error(e.status, e.message);
		error(500, 'Failed to load manual tasks');
	}
};
