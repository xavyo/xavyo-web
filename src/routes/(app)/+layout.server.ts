import { error, redirect } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import type { LayoutServerLoad } from './$types';
import { SYSTEM_TENANT_ID, hasAdminRole } from '$lib/server/auth';
import { fetchAlerts } from '$lib/api/alerts';
import { getCurrentAssumption } from '$lib/api/power-of-attorney';
import { getCurrentContext } from '$lib/api/persona-context';
import { ApiError } from '$lib/api/client';

function loadError(e: unknown, fallback: string): never {
	if (e instanceof ApiError) error(e.status, e.message);
	error(500, fallback);
}

export const load: LayoutServerLoad = async ({ locals, url, fetch }) => {
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

	try {
		const [alertsResult, currentAssumption, personaContext] = await Promise.all([
			fetchAlerts(
				{ limit: 1, acknowledged: false },
				locals.accessToken!,
				locals.tenantId!,
				fetch
			),
			getCurrentAssumption(locals.accessToken!, locals.tenantId!, fetch),
			getCurrentContext(locals.accessToken!, locals.tenantId!, fetch)
		]);

		return {
			user: locals.user,
			unacknowledgedAlertCount: alertsResult.unacknowledged_count,
			isAdmin: hasAdminRole(locals.user.roles),
			currentAssumption,
			personaContext,
			appVersion: env.APP_VERSION || 'dev'
		};
	} catch (e) {
		loadError(e, 'Failed to load session context');
	}
};
