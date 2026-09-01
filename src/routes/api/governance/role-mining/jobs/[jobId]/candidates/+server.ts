import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { listCandidates } from '$lib/api/role-mining';
import { finiteNumber, listPagination } from '$lib/server/list-pagination';

export const GET: RequestHandler = async ({ params, url, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) {
		error(401, 'Unauthorized');
	}

	const status =
		url.searchParams.get('status') ?? url.searchParams.get('promotion_status') ?? undefined;
	const min_confidence = finiteNumber(url.searchParams.get('min_confidence'));

	const result = await listCandidates(
		params.jobId,
		{ status, min_confidence, ...listPagination(url) },
		locals.accessToken,
		locals.tenantId,
		fetch
	);

	return json(result);
};
