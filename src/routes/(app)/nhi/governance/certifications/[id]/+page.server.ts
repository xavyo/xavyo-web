import type { PageServerLoad } from './$types';
import { error, isHttpError, redirect } from '@sveltejs/kit';
import { getNhiCertCampaign, listNhiCertCampaignItems } from '$lib/api/nhi-governance';
import { ApiError } from '$lib/api/client';
import { hasAdminRole } from '$lib/server/auth';

export const load: PageServerLoad = async ({ params, locals, fetch }) => {
	if (!hasAdminRole(locals.user?.roles)) {
		redirect(302, '/dashboard');
	}

	try {
		const [campaign, itemsResult] = await Promise.all([
			getNhiCertCampaign(params.id, locals.accessToken!, locals.tenantId!, fetch),
			listNhiCertCampaignItems(
				params.id,
				{ limit: 100, offset: 0 },
				locals.accessToken!,
				locals.tenantId!,
				fetch
			).catch(() => ({ items: [], total: 0 }))
		]);

		return { campaign, campaignItems: itemsResult.items };
	} catch (e) {
		if (isHttpError(e)) throw e;
		if (e instanceof ApiError) {
			error(e.status, e.message);
		}
		error(500, 'Failed to load certification campaign');
	}
};
