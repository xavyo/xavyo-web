import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { hasAdminRole } from '$lib/server/auth';
import { listProvisioningScripts } from '$lib/api/provisioning-scripts';
import { listScriptTemplates } from '$lib/api/provisioning-scripts';
import { getScriptAnalyticsDashboard } from '$lib/api/script-analytics';

export const load: PageServerLoad = async ({ locals }) => {
	const { accessToken, tenantId, user } = locals;
	if (!accessToken || !tenantId) throw redirect(302, '/login');
	if (!hasAdminRole(user?.roles ?? [])) throw redirect(302, '/');

	const [scriptsResult, templatesResult, dashboard] = await Promise.all([
		listProvisioningScripts({ page: 1, page_size: 50 }, accessToken, tenantId).catch(() => ({ scripts: [], total: 0 })),
		listScriptTemplates({ page: 1, page_size: 50 }, accessToken, tenantId).catch(() => ({ templates: [], total: 0 })),
		getScriptAnalyticsDashboard(accessToken, tenantId).catch(() => null)
	]);

	return {
		scripts: scriptsResult.scripts,
		scriptsTotal: scriptsResult.total,
		templates: templatesResult.templates,
		templatesTotal: templatesResult.total,
		dashboard
	};
};
