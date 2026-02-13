import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { listOrphanDetections } from '$lib/api/nhi-governance';
import { ApiError } from '$lib/api/client';
import { hasAdminRole } from '$lib/server/auth';

export const GET: RequestHandler = async ({ locals, fetch, url }) => {
	if (!locals.accessToken || !locals.tenantId) {
		error(401, 'Unauthorized');
	}
	if (!hasAdminRole(locals.user?.roles)) {
		error(403, 'Forbidden');
	}

	const limit = url.searchParams.get('limit');
	const offset = url.searchParams.get('offset');
	const status = url.searchParams.get('status');

	try {
		const result = await listOrphanDetections(
			locals.accessToken,
			locals.tenantId,
			fetch,
			{
				limit: limit ? parseInt(limit, 10) : undefined,
				offset: offset ? parseInt(offset, 10) : undefined,
				status: status ?? undefined
			}
		);
		return json(result);
	} catch (e) {
		if (e instanceof ApiError) error(e.status, e.message);
		throw e;
	}
};
