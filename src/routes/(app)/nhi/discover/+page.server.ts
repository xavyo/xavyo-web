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
		return { gateways };
	} catch (e) {
		if (e instanceof ApiError) error(e.status, e.message);
		error(500, 'Failed to load gateways');
	}
};
