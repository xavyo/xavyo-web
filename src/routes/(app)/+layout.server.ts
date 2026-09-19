import { error, redirect } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import type { LayoutServerLoad } from './$types';
import { hasAdminRole } from '$lib/server/auth';
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

	// Security alerts are self-service (any authenticated user). Power-of-attorney
	// assumption and persona context are admin-only capabilities, so only request
	// them for admins — otherwise a role-less user (e.g. a freshly JIT-provisioned
	// SSO user, or an invited member before roles are granted) would 403 on those
	// admin endpoints and the entire app shell would fail to load.
	const isAdmin = hasAdminRole(locals.user.roles);
	try {
		const [alertsResult, currentAssumption, personaContext] = await Promise.all([
			fetchAlerts(
				{ limit: 1, acknowledged: false },
				locals.accessToken!,
				locals.tenantId!,
				fetch
			),
			isAdmin
				? getCurrentAssumption(locals.accessToken!, locals.tenantId!, fetch)
				: Promise.resolve(null),
			isAdmin ? getCurrentContext(locals.accessToken!, locals.tenantId!, fetch) : Promise.resolve(null)
		]);

		return {
			user: locals.user,
			unacknowledgedAlertCount: alertsResult.unacknowledged_count,
			isAdmin,
			currentAssumption,
			personaContext,
			appVersion: env.APP_VERSION || 'dev'
		};
	} catch (e) {
		loadError(e, 'Failed to load session context');
	}
};
