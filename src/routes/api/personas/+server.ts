import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { listPersonas } from '$lib/api/personas';
import { listPagination } from '$lib/server/list-pagination';

export const GET: RequestHandler = async ({ url, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) {
		error(401, 'Unauthorized');
	}

	const status = url.searchParams.get('status') ?? undefined;
	const archetype_id = url.searchParams.get('archetype_id') ?? undefined;
	const { limit, offset } = listPagination(url);

	const result = await listPersonas(
		{ offset: offset ?? 0, limit: limit ?? 20, status, archetype_id },
		locals.accessToken,
		locals.tenantId,
		fetch
	);

	return json(result);
};
