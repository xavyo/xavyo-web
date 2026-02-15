import type { Actions, PageServerLoad } from './$types';
import { error, fail, redirect } from '@sveltejs/kit';
import { hasAdminRole } from '$lib/server/auth';
import { getScimTarget, deleteScimTarget } from '$lib/api/scim-targets';
import { ApiError } from '$lib/api/client';

export const load: PageServerLoad = async ({ params, locals, fetch }) => {
	if (!hasAdminRole(locals.user?.roles)) {
		redirect(302, '/dashboard');
	}

	let target;
	try {
		target = await getScimTarget(params.id, locals.accessToken!, locals.tenantId!, fetch);
	} catch (e) {
		if (e instanceof ApiError) {
			error(e.status, e.message);
		}
		error(500, 'Failed to load SCIM target');
	}

	return { target };
};

export const actions: Actions = {
	delete: async ({ params, locals, fetch }) => {
		try {
			await deleteScimTarget(params.id, locals.accessToken!, locals.tenantId!, fetch);
		} catch (e) {
			if (e instanceof ApiError) {
				return fail(e.status, { error: e.message });
			}
			return fail(500, { error: 'An unexpected error occurred' });
		}
		redirect(302, '/settings/scim-targets');
	}
};
