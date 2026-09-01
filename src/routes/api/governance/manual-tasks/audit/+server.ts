import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { listManualTaskAudit } from '$lib/api/manual-tasks';
import { listPagination } from '$lib/server/list-pagination';

export const GET: RequestHandler = async ({ url, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) error(401, 'Unauthorized');

	const result = await listManualTaskAudit(
		{
			task_id: url.searchParams.get('task_id') ?? undefined,
			event_type: url.searchParams.get('event_type') ?? undefined,
			actor_id: url.searchParams.get('actor_id') ?? undefined,
			from_date: url.searchParams.get('from_date') ?? undefined,
			to_date: url.searchParams.get('to_date') ?? undefined,
			...listPagination(url)
		},
		locals.accessToken,
		locals.tenantId,
		fetch
	);
	return json(result);
};
