import type { PageServerLoad } from './$types';
import { listNhiRequests, getNhiRequestSummary } from '$lib/api/nhi-requests';
import { hasAdminRole } from '$lib/server/auth';

export const load: PageServerLoad = async ({ locals, url, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) {
		return { requests: [], summary: null, total: 0, isAdmin: false };
	}

	const status = url.searchParams.get('status') || undefined;
	const limit = 20;
	const offset = Number(url.searchParams.get('offset') || '0');
	const isAdmin = hasAdminRole(locals.user?.roles);

	try {
		const [requestsResult, summary] = await Promise.all([
			listNhiRequests({ status, limit, offset }, locals.accessToken, locals.tenantId, fetch),
			getNhiRequestSummary(locals.accessToken, locals.tenantId, fetch).catch(() => null)
		]);

		return {
			requests: requestsResult.items,
			total: requestsResult.total,
			summary,
			isAdmin
		};
	} catch {
		return { requests: [], summary: null, total: 0, isAdmin };
	}
};
