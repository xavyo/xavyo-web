import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { listRiskScores } from '$lib/api/risk';
import { finiteNumber, listPagination } from '$lib/server/list-pagination';

export const GET: RequestHandler = async ({ url, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) {
		error(401, 'Unauthorized');
	}

	const risk_level = url.searchParams.get('risk_level') ?? undefined;
	const min_score = finiteNumber(url.searchParams.get('min_score'));
	const max_score = finiteNumber(url.searchParams.get('max_score'));
	const sort_by = url.searchParams.get('sort_by') ?? undefined;

	const result = await listRiskScores(
		{ risk_level, min_score, max_score, sort_by, ...listPagination(url) },
		locals.accessToken,
		locals.tenantId,
		fetch
	);

	return json(result);
};
