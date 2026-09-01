import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { listRiskAlerts } from '$lib/api/risk';
import { ApiError } from '$lib/api/client';
import { listPagination } from '$lib/server/list-pagination';

export const GET: RequestHandler = async ({ url, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) error(401, 'Unauthorized');

	const user_id = url.searchParams.get('user_id') ?? undefined;
	const threshold_id = url.searchParams.get('threshold_id') ?? undefined;
	const severity = url.searchParams.get('severity') ?? undefined;
	const acknowledged = url.searchParams.get('acknowledged') === 'true' ? true : url.searchParams.get('acknowledged') === 'false' ? false : undefined;
	const sort_by = url.searchParams.get('sort_by') ?? undefined;


	try {
		const result = await listRiskAlerts(
			{ user_id, threshold_id, severity, acknowledged, sort_by, ...listPagination(url) },
			locals.accessToken, locals.tenantId, fetch
		);
		return json(result);
	} catch (e) {
		if (e instanceof ApiError) error(e.status, e.message);
		error(500, 'Internal error');
	}
};
