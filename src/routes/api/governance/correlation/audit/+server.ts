import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { listCorrelationAuditEvents } from '$lib/api/correlation';
import { listPagination } from '$lib/server/list-pagination';

export const GET: RequestHandler = async ({ url, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) error(401, 'Unauthorized');

	const connector_id = url.searchParams.get('connector_id') ?? undefined;
	const event_type = url.searchParams.get('event_type') ?? undefined;
	const outcome = url.searchParams.get('outcome') ?? undefined;
	const start_date = url.searchParams.get('start_date') ?? undefined;
	const end_date = url.searchParams.get('end_date') ?? undefined;
	const actor_id = url.searchParams.get('actor_id') ?? undefined;

	const result = await listCorrelationAuditEvents(
		{ connector_id, event_type, outcome, start_date, end_date, actor_id, ...listPagination(url) },
		locals.accessToken, locals.tenantId, fetch
	);
	return json(result);
};
