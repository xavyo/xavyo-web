import type { PageServerLoad } from './$types';
import { error, isHttpError, redirect } from '@sveltejs/kit';
import { listNhiCertCampaigns } from '$lib/api/nhi-governance';
import { ApiError } from '$lib/api/client';
import { hasAdminRole } from '$lib/server/auth';
import { listNhi } from '$lib/api/nhi';

export const load: PageServerLoad = async ({ params, locals, fetch }) => {
	if (!hasAdminRole(locals.user?.roles)) {
		redirect(302, '/dashboard');
	}

	try {
		// Fetch campaigns and find the one matching our ID
		const campaigns = await listNhiCertCampaigns(
			{},
			locals.accessToken!,
			locals.tenantId!,
			fetch
		);
		const campaign = campaigns.find((c) => c.id === params.id);
		if (!campaign) {
			error(404, 'Campaign not found');
		}

		// Load NHI entities in scope for certification actions
		const nhiList = await listNhi(
			{
				nhi_type: campaign.nhi_type_filter || undefined,
				limit: 100,
				offset: 0
			},
			locals.accessToken!,
			locals.tenantId!,
			fetch
		);

		return { campaign, nhiEntities: nhiList.data };
	} catch (e) {
		if (isHttpError(e)) throw e;
		if (e instanceof ApiError) {
			error(e.status, e.message);
		}
		error(500, 'Failed to load certification campaign');
	}
};
