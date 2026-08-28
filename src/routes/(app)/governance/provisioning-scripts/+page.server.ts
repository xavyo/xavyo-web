import { error, redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { listProvisioningScripts } from '$lib/api/provisioning-scripts';
import { listScriptTemplates } from '$lib/api/provisioning-scripts';
import { getScriptAnalyticsDashboard } from '$lib/api/script-analytics';
import { ApiError } from '$lib/api/client';

export const load: PageServerLoad = async ({ locals }) => {
	const { accessToken, tenantId, user } = locals;
	if (!accessToken || !tenantId) throw redirect(302, '/login');

	try {
		const [scriptsResult, templatesResult, dashboard] = await Promise.all([
			listProvisioningScripts({ page: 1, page_size: 50 }, accessToken, tenantId),
			listScriptTemplates({ page: 1, page_size: 50 }, accessToken, tenantId),
			getScriptAnalyticsDashboard(accessToken, tenantId)
		]);

		return {
			scripts: scriptsResult.scripts,
			scriptsTotal: scriptsResult.total,
			templates: templatesResult.templates,
			templatesTotal: templatesResult.total,
			dashboard
		};
	} catch (e) {
		if (e instanceof ApiError) error(e.status, e.message);
		error(500, 'Failed to load provisioning scripts');
	}
};
