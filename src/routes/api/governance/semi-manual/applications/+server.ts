import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { listSemiManualApplications } from '$lib/api/semi-manual';
import { listPagination } from '$lib/server/list-pagination';

export const GET: RequestHandler = async ({ url, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) error(401, 'Unauthorized');


	const result = await listSemiManualApplications(
		{ ...listPagination(url) },
		locals.accessToken, locals.tenantId, fetch
	);
	return json(result);
};
