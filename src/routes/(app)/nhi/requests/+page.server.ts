import type { PageServerLoad } from './$types';
import { listNhiRequests, getNhiRequestSummary } from '$lib/api/nhi-requests';
import { hasAdminRole } from '$lib/server/auth';
import { error } from '@sveltejs/kit';
import { ApiError } from '$lib/api/client';

export const load: PageServerLoad = async ({ locals, url, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) error(401, 'Unauthorized');

	const status = url.searchParams.get('status') || undefined;
	const limit = 20;
	const offset = Number(url.searchParams.get('offset') || '0');
	const isAdmin = hasAdminRole(locals.user?.roles);

	try {
		const [requestsResult, summary] = await Promise.all([
			listNhiRequests({ status, limit, offset }, locals.accessToken, locals.tenantId, fetch),
			getNhiRequestSummary(locals.accessToken, locals.tenantId, fetch)
		]);

		return {
			requests: requestsResult.items,
			total: requestsResult.total,
			summary,
			isAdmin
		};
	} catch (e) {
		if (e instanceof ApiError) error(e.status, e.message);
		error(500, 'Failed to load NHI requests');
	}
};
