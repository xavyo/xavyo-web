import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { listMyApprovals } from '$lib/api/access-requests';

export const GET: RequestHandler = async ({ url, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) {
		error(401, 'Unauthorized');
	}

	const offset = Number(url.searchParams.get('offset') ?? '0');
	const limit = Number(url.searchParams.get('limit') ?? '20');

	const result = await listMyApprovals(
		{ limit, offset },
		locals.accessToken,
		locals.tenantId,
		fetch
	);

	return json(result);
};
