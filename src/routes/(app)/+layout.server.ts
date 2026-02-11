import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';
import { SYSTEM_TENANT_ID } from '$lib/server/auth';

export const load: LayoutServerLoad = async ({ locals, url }) => {
	if (!locals.user) {
		const redirectTo = encodeURIComponent(url.pathname + url.search);
		redirect(302, `/login?redirectTo=${redirectTo}`);
	}

	// Redirect system-tenant users to onboarding (unless already there)
	if (
		(!locals.tenantId || locals.tenantId === SYSTEM_TENANT_ID) &&
		!url.pathname.startsWith('/onboarding')
	) {
		redirect(302, '/onboarding');
	}

	return {
		user: locals.user
	};
};
