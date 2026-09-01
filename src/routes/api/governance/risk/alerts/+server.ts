import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { listRiskAlerts } from '$lib/api/risk';
import { listPagination } from '$lib/server/list-pagination';

export const GET: RequestHandler = async ({ url, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) {
		error(401, 'Unauthorized');
	}

	const acknowledged =
		url.searchParams.get('acknowledged') === 'true'
			? true
			: url.searchParams.get('acknowledged') === 'false'
				? false
				: undefined;

	const result = await listRiskAlerts(
		{
			user_id: url.searchParams.get('user_id') ?? undefined,
			threshold_id: url.searchParams.get('threshold_id') ?? undefined,
			severity: url.searchParams.get('severity') ?? undefined,
			acknowledged,
			sort_by: url.searchParams.get('sort_by') ?? undefined,
			...listPagination(url)
		},
		locals.accessToken,
		locals.tenantId,
		fetch
	);

	return json(result);
};
