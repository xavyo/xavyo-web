import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { listCorrelationCases } from '$lib/api/correlation';

export const GET: RequestHandler = async ({ url, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) error(401, 'Unauthorized');

	const status = url.searchParams.get('status') ?? undefined;
	const connector_id = url.searchParams.get('connector_id') ?? undefined;
	const assigned_to = url.searchParams.get('assigned_to') ?? undefined;
	const trigger_type = url.searchParams.get('trigger_type') ?? undefined;
	const start_date = url.searchParams.get('start_date') ?? undefined;
	const end_date = url.searchParams.get('end_date') ?? undefined;
	const sort_by = url.searchParams.get('sort_by') ?? undefined;
	const sort_order = url.searchParams.get('sort_order') ?? undefined;
	const limit = Number(url.searchParams.get('limit') ?? '50');
	const offset = Number(url.searchParams.get('offset') ?? '0');

	const result = await listCorrelationCases(
		{ status, connector_id, assigned_to, trigger_type, start_date, end_date, sort_by, sort_order, limit, offset },
		locals.accessToken, locals.tenantId, fetch
	);
	return json(result);
};
