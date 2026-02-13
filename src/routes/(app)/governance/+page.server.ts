import type { PageServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';
import { hasAdminRole } from '$lib/server/auth';

export const load: PageServerLoad = async ({ locals, url }) => {
	if (!hasAdminRole(locals.user?.roles)) {
		redirect(302, '/dashboard');
	}
	const tab = url.searchParams.get('tab') ?? undefined;
	return { tab };
};
