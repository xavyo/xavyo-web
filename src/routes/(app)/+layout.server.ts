import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';
import { SYSTEM_TENANT_ID, hasAdminRole } from '$lib/server/auth';
import { fetchAlerts } from '$lib/api/alerts';

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

	let unacknowledgedAlertCount = 0;
	try {
		const alertsResult = await fetchAlerts(
			{ limit: 1, acknowledged: false },
			locals.accessToken!,
			locals.tenantId!
		);
		unacknowledgedAlertCount = alertsResult.unacknowledged_count;
	} catch {
		// Non-critical; default to 0
	}

	return {
		user: locals.user,
		unacknowledgedAlertCount,
		isAdmin: hasAdminRole(locals.user.roles)
	};
};
