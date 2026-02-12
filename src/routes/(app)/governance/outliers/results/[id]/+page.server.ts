import type { PageServerLoad } from './$types';
import { error, redirect } from '@sveltejs/kit';
import { getOutlierResult } from '$lib/api/outliers';
import { ApiError } from '$lib/api/client';
import { hasAdminRole } from '$lib/server/auth';

export const load: PageServerLoad = async ({ params, locals, fetch }) => {
	if (!hasAdminRole(locals.user?.roles)) {
		redirect(302, '/dashboard');
	}
	if (!locals.accessToken || !locals.tenantId) {
		redirect(302, '/login');
	}

	try {
		const result = await getOutlierResult(params.id, locals.accessToken, locals.tenantId, fetch);
		return { result };
	} catch (e) {
		if (e instanceof ApiError && e.status === 404) {
			error(404, 'Outlier result not found');
		}
		throw e;
	}
};
