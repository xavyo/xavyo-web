import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { listSodViolations } from '$lib/api/governance';
import { listPagination } from '$lib/server/list-pagination';

export const GET: RequestHandler = async ({ url, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) {
		error(401, 'Unauthorized');
	}

	const result = await listSodViolations(
		listPagination(url),
		locals.accessToken,
		locals.tenantId,
		fetch
	);

	return json(result);
};
