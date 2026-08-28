import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { listInheritances } from '$lib/api/meta-roles';
import { listPagination } from '$lib/server/list-pagination';

export const GET: RequestHandler = async ({ params, url, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) {
		error(401, 'Unauthorized');
	}

	const status = url.searchParams.get('status') ?? undefined;

	const result = await listInheritances(
		params.id,
		{ status, ...listPagination(url) },
		locals.accessToken,
		locals.tenantId,
		fetch
	);

	return json(result);
};
