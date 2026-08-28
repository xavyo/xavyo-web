import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { listNhi } from '$lib/api/nhi';
import { listPagination } from '$lib/server/list-pagination';

export const GET: RequestHandler = async ({ url, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) {
		error(401, 'Unauthorized');
	}

	const nhi_type = url.searchParams.get('nhi_type') ?? undefined;
	const lifecycle_state = url.searchParams.get('lifecycle_state') ?? undefined;
	const { limit, offset } = listPagination(url);

	const result = await listNhi(
		{ offset: offset ?? 0, limit: limit ?? 20, nhi_type, lifecycle_state },
		locals.accessToken,
		locals.tenantId,
		fetch
	);

	return json(result);
};
