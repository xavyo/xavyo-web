import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getDiscrepancyTrend } from '$lib/api/reconciliation';

export const GET: RequestHandler = async ({ url, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) {
		error(401, 'Unauthorized');
	}

	const connector_id = url.searchParams.get('connector_id') ?? undefined;
	const from = url.searchParams.get('from') ?? undefined;
	const to = url.searchParams.get('to') ?? undefined;

	const result = await getDiscrepancyTrend(
		{ connector_id, from, to },
		locals.accessToken,
		locals.tenantId,
		fetch
	);

	return json(result);
};
