import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { hasAdminRole } from '$lib/server/auth';

export const load: PageServerLoad = async ({ locals }) => {
	if (!hasAdminRole(locals.user?.roles)) {
		redirect(302, '/dashboard');
	}

	return {};
};
