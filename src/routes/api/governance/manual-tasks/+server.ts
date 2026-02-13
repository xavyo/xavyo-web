import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { listManualTasks } from '$lib/api/manual-tasks';

export const GET: RequestHandler = async ({ url, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) error(401, 'Unauthorized');

	const status = url.searchParams.get('status') ?? undefined;
	const application_id = url.searchParams.get('application_id') ?? undefined;
	const user_id = url.searchParams.get('user_id') ?? undefined;
	const sla_breached = url.searchParams.get('sla_breached') === 'true' ? true : url.searchParams.get('sla_breached') === 'false' ? false : undefined;
	const assignee_id = url.searchParams.get('assignee_id') ?? undefined;
	const limit = Number(url.searchParams.get('limit') ?? '50');
	const offset = Number(url.searchParams.get('offset') ?? '0');

	const result = await listManualTasks(
		{ status, application_id, user_id, sla_breached, assignee_id, limit, offset },
		locals.accessToken, locals.tenantId, fetch
	);
	return json(result);
};
