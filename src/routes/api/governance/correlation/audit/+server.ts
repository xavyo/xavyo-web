import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { listCorrelationAuditEvents } from '$lib/api/correlation';

export const GET: RequestHandler = async ({ url, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) error(401, 'Unauthorized');

	const connector_id = url.searchParams.get('connector_id') ?? undefined;
	const event_type = url.searchParams.get('event_type') ?? undefined;
	const outcome = url.searchParams.get('outcome') ?? undefined;
	const start_date = url.searchParams.get('start_date') ?? undefined;
	const end_date = url.searchParams.get('end_date') ?? undefined;
	const actor_id = url.searchParams.get('actor_id') ?? undefined;
	const limit = Number(url.searchParams.get('limit') ?? '50');
	const offset = Number(url.searchParams.get('offset') ?? '0');

	const result = await listCorrelationAuditEvents(
		{ connector_id, event_type, outcome, start_date, end_date, actor_id, limit, offset },
		locals.accessToken, locals.tenantId, fetch
	);
	return json(result);
};
