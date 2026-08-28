import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { listAccessPatterns } from '$lib/api/role-mining';
import { finiteNumber, listPagination } from '$lib/server/list-pagination';

export const GET: RequestHandler = async ({ params, url, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) {
		error(401, 'Unauthorized');
	}

	const min_frequency = finiteNumber(url.searchParams.get('min_frequency'));

	const result = await listAccessPatterns(
		params.jobId,
		{ min_frequency, ...listPagination(url) },
		locals.accessToken,
		locals.tenantId,
		fetch
	);

	return json(result);
};
