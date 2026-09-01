import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { listNhiCertCampaignItems } from '$lib/api/nhi-cert-campaigns';
import { listPagination } from '$lib/server/list-pagination';
import { ApiError } from '$lib/api/client';

export const GET: RequestHandler = async ({ locals, params, url, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) return json({ error: 'Unauthorized' }, { status: 401 });
	try {
		const decision = url.searchParams.get('decision') || undefined;
		const status = url.searchParams.get('status') || undefined;
		const reviewer_id = url.searchParams.get('reviewer_id') || undefined;
		const owner_id = url.searchParams.get('owner_id') || undefined;
		const my_pending =
			url.searchParams.get('my_pending') === 'true'
				? true
				: url.searchParams.get('my_pending') === 'false'
					? false
					: undefined;
		const result = await listNhiCertCampaignItems(
			params.campaignId,
			{ decision, status, reviewer_id, owner_id, my_pending, ...listPagination(url) },
			locals.accessToken,
			locals.tenantId,
			fetch
		);
		return json(result);
	} catch (e) {
		if (e instanceof ApiError) return json({ error: e.message }, { status: e.status });
		return json({ error: 'Internal error' }, { status: 500 });
	}
};
