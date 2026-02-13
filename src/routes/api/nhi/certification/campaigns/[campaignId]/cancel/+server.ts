import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { cancelNhiCertCampaignV2 } from '$lib/api/nhi-cert-campaigns';
import { hasAdminRole } from '$lib/server/auth';
import { ApiError } from '$lib/api/client';

export const POST: RequestHandler = async ({ locals, params, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) return json({ error: 'Unauthorized' }, { status: 401 });
	if (!hasAdminRole(locals.user?.roles)) return json({ error: 'Forbidden' }, { status: 403 });
	try {
		const result = await cancelNhiCertCampaignV2(params.campaignId, locals.accessToken, locals.tenantId, fetch);
		return json(result);
	} catch (e) {
		if (e instanceof ApiError) return json({ error: e.message }, { status: e.status });
		return json({ error: 'Internal error' }, { status: 500 });
	}
};
