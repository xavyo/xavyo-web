import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { listCatalogRequests } from '$lib/api/catalog';
import { listPagination } from '$lib/server/list-pagination';

export const GET: RequestHandler = async ({ url, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) error(401, 'Unauthorized');
	const status = url.searchParams.get('status') ?? undefined;
	const submission_id = url.searchParams.get('submission_id') ?? undefined;
	const result = await listCatalogRequests(
		{ status, submission_id, ...listPagination(url) },
		locals.accessToken,
		locals.tenantId,
		fetch
	);
	return json(result);
};
