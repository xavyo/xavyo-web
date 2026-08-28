import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { listRiskScores } from '$lib/api/risk';
import { listPagination } from '$lib/server/list-pagination';

export const GET: RequestHandler = async ({ url, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) {
		error(401, 'Unauthorized');
	}

	const risk_level = url.searchParams.get('risk_level') ?? undefined;
	const sort_by = url.searchParams.get('sort_by') ?? undefined;

	const result = await listRiskScores(
		{ risk_level, sort_by, ...listPagination(url) },
		locals.accessToken,
		locals.tenantId,
		fetch
	);

	return json(result);
};
