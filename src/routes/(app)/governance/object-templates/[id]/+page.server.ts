import type { PageServerLoad } from './$types';
import { redirect, error } from '@sveltejs/kit';
import { hasAdminRole } from '$lib/server/auth';
import { getObjectTemplate } from '$lib/api/object-templates';

export const load: PageServerLoad = async ({ locals, params }) => {
	if (!hasAdminRole(locals.user?.roles)) {
		redirect(302, '/dashboard');
	}

	try {
		const template = await getObjectTemplate(params.id, locals.accessToken!, locals.tenantId!);
		return { template };
	} catch {
		error(404, 'Template not found');
	}
};
