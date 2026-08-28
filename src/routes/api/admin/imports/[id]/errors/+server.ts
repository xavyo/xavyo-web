import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { listImportErrors } from '$lib/api/imports';
import { listPagination } from '$lib/server/list-pagination';

export const GET: RequestHandler = async ({ params, url, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) {
		error(401, 'Unauthorized');
	}

	const result = await listImportErrors(
		params.id,
		{ ...listPagination(url) },
		locals.accessToken,
		locals.tenantId,
		fetch
	);

	return json(result);
};
