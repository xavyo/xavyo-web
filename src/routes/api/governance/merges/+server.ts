import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { listMergeOperations } from '$lib/api/dedup';
import { listPagination } from '$lib/server/list-pagination';

export const GET: RequestHandler = async ({ url, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) {
		error(401, 'Unauthorized');
	}

	const status = url.searchParams.get('status') ?? undefined;
	const identity_id = url.searchParams.get('identity_id') ?? undefined;

	const result = await listMergeOperations(
		{ status, identity_id, ...listPagination(url) },
		locals.accessToken,
		locals.tenantId,
		fetch
	);

	return json(result);
};
