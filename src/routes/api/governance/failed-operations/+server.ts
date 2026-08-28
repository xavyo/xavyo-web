import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { listFailedOperations } from '$lib/api/governance-operations';
import { ApiError } from '$lib/api/client';
import { hasAdminRole } from '$lib/server/auth';
import { listPagination } from '$lib/server/list-pagination';

export const GET: RequestHandler = async ({ url, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) error(401, 'Unauthorized');
	if (!hasAdminRole(locals.user?.roles)) error(403, 'Forbidden');

	try {
		const result = await listFailedOperations(
			{
				...listPagination(url)
			},
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
