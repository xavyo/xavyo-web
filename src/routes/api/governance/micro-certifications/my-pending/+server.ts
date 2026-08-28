import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getMyPendingCertifications } from '$lib/api/micro-certifications';
import { listPagination } from '$lib/server/list-pagination';

export const GET: RequestHandler = async ({ url, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) error(401, 'Unauthorized');

	const { limit, offset } = listPagination(url);
	const result = await getMyPendingCertifications(
		{ limit: limit ?? 20, offset: offset ?? 0 },
		locals.accessToken,
		locals.tenantId,
		fetch
	);
	return json(result);
};
