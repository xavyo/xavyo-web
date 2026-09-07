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

	// System-tenant users have not provisioned an organization yet. They must go
	// through onboarding first, and we must NOT issue tenant-scoped/admin-only
	// context calls for them (alerts/assumption/context) — those 403 for a
	// non-admin and would break the onboarding page entirely.
	const inSystemTenant = !locals.tenantId || locals.tenantId === SYSTEM_TENANT_ID;
	if (inSystemTenant && !url.pathname.startsWith('/logout')) {
		if (!url.pathname.startsWith('/onboarding')) {
			redirect(302, '/onboarding');
		}
		return {
			user: locals.user,
			unacknowledgedAlertCount: 0,
			isAdmin: hasAdminRole(locals.user.roles),
			currentAssumption: null,
			personaContext: null,
			appVersion: env.APP_VERSION || 'dev'
		};
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
