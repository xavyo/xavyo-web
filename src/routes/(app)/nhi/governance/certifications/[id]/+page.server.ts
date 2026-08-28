import type { PageServerLoad } from './$types';
import { error, isHttpError } from '@sveltejs/kit';
import { getNhiCertCampaign, listNhiCertCampaignItems } from '$lib/api/nhi-governance';
import { ApiError } from '$lib/api/client';

export const load: PageServerLoad = async ({ params, locals, fetch }) => {

	try {
		const [campaign, itemsResult] = await Promise.all([
			getNhiCertCampaign(params.id, locals.accessToken!, locals.tenantId!, fetch),
			listNhiCertCampaignItems(
				params.id,
				{ limit: 100, offset: 0 },
				locals.accessToken!,
				locals.tenantId!,
				fetch
			)
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
