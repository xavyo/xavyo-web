import { error, redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { listGateways } from '$lib/api/nhi-discovery';
import { ApiError } from '$lib/api/client';

export const load: PageServerLoad = async ({ locals, fetch }) => {
	if (!locals.user) {
		redirect(302, '/login');
	}
	if (!locals.accessToken || !locals.tenantId) error(401, 'Unauthorized');

	try {
		const gateways = await listGateways(locals.accessToken, locals.tenantId, fetch);
		return { gateways, notConfigured: false, configHint: '' };
	} catch (e) {
		if (e instanceof ApiError) {
			// A 400 here means no AgentGateway is configured for this tenant yet.
			// That's a normal unconfigured state, not a page failure — render a
			// helpful empty state instead of crashing to the error page.
			if (e.status === 400) {
				return { gateways: [], notConfigured: true, configHint: e.message };
			}
			error(e.status, e.message);
		}
		error(500, 'Failed to load gateways');
	}
};
