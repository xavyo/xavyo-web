import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { listNhiCertCampaignItems } from '$lib/api/nhi-cert-campaigns';
import { listPagination } from '$lib/server/list-pagination';
import { ApiError } from '$lib/api/client';

export const GET: RequestHandler = async ({ locals, params, url, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) return json({ error: 'Unauthorized' }, { status: 401 });
	try {
		const decision = url.searchParams.get('decision') || undefined;
		const result = await listNhiCertCampaignItems(
			params.campaignId,
			{ decision, ...listPagination(url) },
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
