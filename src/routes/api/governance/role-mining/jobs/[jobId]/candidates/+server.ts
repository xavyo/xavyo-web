import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { listCandidates } from '$lib/api/role-mining';
import { listPagination } from '$lib/server/list-pagination';

export const GET: RequestHandler = async ({ params, url, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) {
		error(401, 'Unauthorized');
	}

	const promotion_status = url.searchParams.get('promotion_status') || undefined;

	const result = await listCandidates(
		params.jobId,
		{ promotion_status, ...listPagination(url) },
		locals.accessToken,
		locals.tenantId,
		fetch
	);

	return json(result);
};
