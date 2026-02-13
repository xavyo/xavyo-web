import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { hasAdminRole } from '$lib/server/auth';
import { getProvisioningScript, listScriptVersions, listHookBindings } from '$lib/api/provisioning-scripts';
import { listScriptExecutionLogs } from '$lib/api/script-analytics';

export const load: PageServerLoad = async ({ locals, params }) => {
	const { accessToken, tenantId, user } = locals;
	if (!accessToken || !tenantId) throw redirect(302, '/login');
	if (!hasAdminRole(user?.roles)) throw redirect(302, '/');

	const script = await getProvisioningScript(params.id, accessToken, tenantId);

	const [versionsResult, bindingsResult, logsResult] = await Promise.all([
		listScriptVersions(params.id, accessToken, tenantId).catch(() => ({ versions: [], total: 0 })),
		listHookBindings({ script_id: params.id, page: 1, page_size: 50 }, accessToken, tenantId).catch(() => ({ bindings: [], total: 0 })),
		listScriptExecutionLogs({ script_id: params.id, page: 1, page_size: 20 }, accessToken, tenantId).catch(() => ({ logs: [], total: 0 }))
	]);

	return {
		script,
		versions: versionsResult.versions,
		versionsTotal: versionsResult.total,
		bindings: bindingsResult.bindings,
		bindingsTotal: bindingsResult.total,
		logs: logsResult.logs,
		logsTotal: logsResult.total
	};
};
