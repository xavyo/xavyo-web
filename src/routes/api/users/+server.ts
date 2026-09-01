import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { listUsers } from '$lib/api/users';
import { listPagination } from '$lib/server/list-pagination';

export const GET: RequestHandler = async ({ url, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) {
		error(401, 'Unauthorized');
	}

	const email = url.searchParams.get('email') ?? undefined;
	const is_active =
		url.searchParams.get('is_active') === 'true'
			? true
			: url.searchParams.get('is_active') === 'false'
				? false
				: undefined;

	const result = await listUsers(
		{ email, is_active, ...listPagination(url) },
		locals.accessToken,
		locals.tenantId,
		fetch
	);

	return json(result);
};
