import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { listArchetypes } from '$lib/api/personas';
import { listPagination } from '$lib/server/list-pagination';

export const GET: RequestHandler = async ({ url, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) {
		error(401, 'Unauthorized');
	}

	const name_contains = url.searchParams.get('name_contains') ?? undefined;
	const is_active_param = url.searchParams.get('is_active');
	const is_active = is_active_param !== null ? is_active_param === 'true' : undefined;

	const result = await listArchetypes(
		{ name_contains, is_active, ...listPagination(url) },
		locals.accessToken,
		locals.tenantId,
		fetch
	);

	return json(result);
};
