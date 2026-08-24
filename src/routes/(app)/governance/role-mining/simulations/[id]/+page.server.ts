import type { PageServerLoad } from './$types';
import { redirect, error } from '@sveltejs/kit';
import { hasAdminRole } from '$lib/server/auth';
import { getSimulation } from '$lib/api/role-mining';
import { ApiError } from '$lib/api/client';

export const load: PageServerLoad = async ({ params, locals, fetch }) => {
	if (!hasAdminRole(locals.user?.roles)) {
		redirect(302, '/');
	}
	if (!locals.accessToken || !locals.tenantId) {
		redirect(302, '/login');
	}

	try {
		const simulation = await getSimulation(params.id, locals.accessToken, locals.tenantId, fetch);
		return { simulation };
	} catch (e) {
		if (e instanceof ApiError) error(e.status, e.message);
		error(500, 'Failed to load simulation');
	}
};
