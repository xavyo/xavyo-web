import type { PageServerLoad } from './$types';
import { redirect, error } from '@sveltejs/kit';
import { hasAdminRole } from '$lib/server/auth';
import { getObjectTemplate } from '$lib/api/object-templates';
import { ApiError } from '$lib/api/client';

export const load: PageServerLoad = async ({ locals, params }) => {
	if (!hasAdminRole(locals.user?.roles)) {
		redirect(302, '/dashboard');
	}

	try {
		const template = await getObjectTemplate(params.id, locals.accessToken!, locals.tenantId!);
		return { template };
	} catch (e) {
		if (e instanceof ApiError) error(e.status, e.message);
		error(500, 'Failed to load object template');
	}
};
