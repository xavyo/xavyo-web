import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { listToolAgents } from '$lib/api/nhi-permissions';
import { ApiError } from '$lib/api/client';
import { listPagination } from '$lib/server/list-pagination';

export const GET: RequestHandler = async ({ params, url, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) {
		error(401, 'Unauthorized');
	}

	try {
		const result = await listToolAgents(
			params.toolId,
			listPagination(url),
			locals.accessToken,
			locals.tenantId,
			fetch
		);

		return json(result);
	} catch (e) {
		if (e instanceof ApiError) error(e.status, e.message);
		throw e;
	}
};
