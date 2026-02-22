import { redirect } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import type { LayoutServerLoad } from './$types';
import { SYSTEM_TENANT_ID, hasAdminRole } from '$lib/server/auth';
import { fetchAlerts } from '$lib/api/alerts';
import { getCurrentAssumption } from '$lib/api/power-of-attorney';
import { getCurrentContext } from '$lib/api/persona-context';
import type { CurrentAssumptionStatus, CurrentContextResponse } from '$lib/api/types';

export const load: LayoutServerLoad = async ({ locals, url }) => {
	if (!locals.user) {
		const redirectTo = encodeURIComponent(url.pathname + url.search);
		redirect(302, `/login?redirectTo=${redirectTo}`);
	}

	// Redirect system-tenant users to onboarding (unless already there or logging out)
	if (
		(!locals.tenantId || locals.tenantId === SYSTEM_TENANT_ID) &&
		!url.pathname.startsWith('/onboarding') &&
		!url.pathname.startsWith('/logout')
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

	let currentAssumption: CurrentAssumptionStatus = { is_assuming: false, poa_id: null, donor_id: null, donor_name: null };
	try {
		currentAssumption = await getCurrentAssumption(locals.accessToken!, locals.tenantId!, fetch);
	} catch {
		// Non-critical; default to not assuming
	}

	let personaContext: CurrentContextResponse | null = null;
	try {
		personaContext = await getCurrentContext(locals.accessToken!, locals.tenantId!, fetch);
	} catch {
		// Non-critical
	}

	return {
		user: locals.user,
		unacknowledgedAlertCount,
		isAdmin: hasAdminRole(locals.user.roles),
		currentAssumption,
		personaContext,
		appVersion: env.APP_VERSION || 'dev'
	};
};
