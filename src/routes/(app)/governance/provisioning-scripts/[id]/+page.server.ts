import { error, redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { hasAdminRole } from '$lib/server/auth';
import { getProvisioningScript, listScriptVersions, listHookBindings } from '$lib/api/provisioning-scripts';
import { listScriptExecutionLogs } from '$lib/api/script-analytics';
import { ApiError } from '$lib/api/client';

export const load: PageServerLoad = async ({ locals, params }) => {
	const { accessToken, tenantId, user } = locals;
	if (!accessToken || !tenantId) throw redirect(302, '/login');
	if (!hasAdminRole(user?.roles)) throw redirect(302, '/');

	try {
		const [script, versionsResult, bindingsResult, logsResult] = await Promise.all([
			getProvisioningScript(params.id, accessToken, tenantId),
			listScriptVersions(params.id, accessToken, tenantId),
			listHookBindings({ script_id: params.id, page: 1, page_size: 50 }, accessToken, tenantId),
			listScriptExecutionLogs({ script_id: params.id, page: 1, page_size: 20 }, accessToken, tenantId)
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
	} catch (e) {
		if (e instanceof ApiError) error(e.status, e.message);
		error(500, 'Failed to load provisioning script');
	}
};
