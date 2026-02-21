import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { hasAdminRole } from '$lib/server/auth';
import { listGateways } from '$lib/api/nhi-discovery';
import type { GatewayInfo } from '$lib/api/types';

export const load: PageServerLoad = async ({ locals, fetch }) => {
	if (!locals.user) {
		redirect(302, '/login');
	}

	if (!hasAdminRole(locals.user.roles)) {
		redirect(302, '/nhi');
	}

	let gateways: GatewayInfo[] = [];
	let gatewayError: string | null = null;
	try {
		gateways = await listGateways(locals.accessToken!, locals.tenantId!, fetch);
	} catch (e) {
		gatewayError = e instanceof Error ? e.message : 'Failed to load gateways';
	}

	return { gateways, gatewayError };
};
