import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { listOrphanDetections } from '$lib/api/nhi-governance';
import { ApiError } from '$lib/api/client';
import { listPagination } from '$lib/server/list-pagination';

export const GET: RequestHandler = async ({ locals, fetch, url }) => {
	if (!locals.accessToken || !locals.tenantId) {
		error(401, 'Unauthorized');
	}

	const status = url.searchParams.get('status');

	try {
		const result = await listOrphanDetections(
			locals.accessToken,
			locals.tenantId,
			fetch,
			{
				...listPagination(url),
				status: status ?? undefined
			}
		);
		return json(result);
	} catch (e) {
		if (e instanceof ApiError) error(e.status, e.message);
		throw e;
	}
};
