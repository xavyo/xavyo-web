import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { hasAdminRole } from '$lib/server/auth';
import { getScriptTemplate } from '$lib/api/provisioning-scripts';

export const load: PageServerLoad = async ({ locals, params }) => {
	const { accessToken, tenantId, user } = locals;
	if (!accessToken || !tenantId) throw redirect(302, '/login');
	if (!hasAdminRole(user?.roles ?? [])) throw redirect(302, '/');

	const template = await getScriptTemplate(params.id, accessToken, tenantId);
	return { template };
};
