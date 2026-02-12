import type { PageServerLoad } from './$types';
import { error, isHttpError, redirect } from '@sveltejs/kit';
import { getMergeAudit } from '$lib/api/dedup';
import { ApiError } from '$lib/api/client';
import { hasAdminRole } from '$lib/server/auth';

export const load: PageServerLoad = async ({ params, locals, fetch }) => {
	if (!hasAdminRole(locals.user?.roles)) {
		redirect(302, '/dashboard');
	}

	try {
		const audit = await getMergeAudit(params.id, locals.accessToken!, locals.tenantId!, fetch);
		return { audit };
	} catch (e) {
		if (isHttpError(e)) throw e;
		if (e instanceof ApiError) {
			if (e.status === 404) {
				error(404, 'Audit record not found');
			}
			error(e.status, e.message);
		}
		error(500, 'Failed to load audit detail');
	}
};
