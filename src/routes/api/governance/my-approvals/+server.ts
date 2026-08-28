import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { listMyApprovals } from '$lib/api/my-approvals';
import { listPagination } from '$lib/server/list-pagination';

export const GET: RequestHandler = async ({ url, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) {
		error(401, 'Unauthorized');
	}

	const status = url.searchParams.get('status') ?? undefined;

	const result = await listMyApprovals(
		{ status, ...listPagination(url) },
		locals.accessToken,
		locals.tenantId,
		fetch
	);

	return json(result);
};
