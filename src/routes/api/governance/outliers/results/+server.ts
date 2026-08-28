import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { listOutlierResults } from '$lib/api/outliers';
import { finiteNumber, listPagination } from '$lib/server/list-pagination';

export const GET: RequestHandler = async ({ url, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) error(401, 'Unauthorized');
	const analysis_id = url.searchParams.get('analysis_id') ?? undefined;
	const user_id = url.searchParams.get('user_id') ?? undefined;
	const classification = url.searchParams.get('classification') ?? undefined;
	const min_score = finiteNumber(url.searchParams.get('min_score'));
	const max_score = finiteNumber(url.searchParams.get('max_score'));
	const result = await listOutlierResults(
		{ analysis_id, user_id, classification, min_score, max_score, ...listPagination(url) },
		locals.accessToken,
		locals.tenantId,
		fetch
	);
	return json(result);
};
