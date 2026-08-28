import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { listUsers } from '$lib/api/users';
import { listPagination } from '$lib/server/list-pagination';

export const GET: RequestHandler = async ({ url, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) {
		error(401, 'Unauthorized');
	}

	const email = url.searchParams.get('email') ?? undefined;

	const result = await listUsers(
		{ email, ...listPagination(url) },
		locals.accessToken,
		locals.tenantId,
		fetch
	);

	return json(result);
};
