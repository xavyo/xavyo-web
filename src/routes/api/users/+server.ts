import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { listUsers } from '$lib/api/users';

export const GET: RequestHandler = async ({ url, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) {
		error(401, 'Unauthorized');
	}

	const offset = Number(url.searchParams.get('offset') ?? '0');
	const limit = Number(url.searchParams.get('limit') ?? '20');
	const email = url.searchParams.get('email') ?? undefined;

	const result = await listUsers(
		{ offset, limit, email },
		locals.accessToken,
		locals.tenantId,
		fetch
	);

	return json(result);
};
