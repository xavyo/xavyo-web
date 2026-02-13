import type { PageServerLoad } from './$types';
import { error, isHttpError, redirect } from '@sveltejs/kit';
import { getSimulationComparison } from '$lib/api/simulations';
import { ApiError } from '$lib/api/client';
import { hasAdminRole } from '$lib/server/auth';

export const load: PageServerLoad = async ({ params, locals, fetch }) => {
	if (!hasAdminRole(locals.user?.roles)) {
		redirect(302, '/dashboard');
	}

	try {
		const comparison = await getSimulationComparison(
			params.id,
			locals.accessToken!,
			locals.tenantId!,
			fetch
		);

		return { comparison };
	} catch (e) {
		if (isHttpError(e)) throw e;
		if (e instanceof ApiError) {
			error(e.status, e.message);
		}
		error(500, 'Failed to load simulation comparison');
	}
};
