import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { listConsolidationSuggestions } from '$lib/api/role-mining';
import { finiteNumber, listPagination } from '$lib/server/list-pagination';

export const GET: RequestHandler = async ({ params, url, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) {
		error(401, 'Unauthorized');
	}

	const status = url.searchParams.get('status') || undefined;
	const min_overlap = finiteNumber(url.searchParams.get('min_overlap'));

	const result = await listConsolidationSuggestions(
		params.jobId,
		{ status, min_overlap, ...listPagination(url) },
		locals.accessToken,
		locals.tenantId,
		fetch
	);

	return json(result);
};
