import type { PageServerLoad, Actions } from './$types';
import { redirect, error, isHttpError, isRedirect } from '@sveltejs/kit';
import { getTicketingConfig, deleteTicketingConfig } from '$lib/api/governance-operations';
import { ApiError } from '$lib/api/client';
import { hasAdminRole } from '$lib/server/auth';
import { fail } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ params, locals, fetch }) => {
	if (!hasAdminRole(locals.user?.roles)) {
		redirect(302, '/dashboard');
	}
	if (!locals.accessToken || !locals.tenantId) {
		error(401, 'Unauthorized');
	}

	let config;
	try {
		config = await getTicketingConfig(params.id, locals.accessToken, locals.tenantId, fetch);
	} catch (e) {
		if (e instanceof ApiError) {
			error(e.status, e.message);
		}
		error(500, 'Failed to load ticketing configuration');
	}

	return { config };
};

export const actions: Actions = {
	delete: async ({ params, locals, fetch }) => {
		if (!locals.accessToken || !locals.tenantId) {
			error(401, 'Unauthorized');
		}

		try {
			await deleteTicketingConfig(params.id, locals.accessToken, locals.tenantId, fetch);
			redirect(302, '/governance/operations');
		} catch (e) {
			if (isRedirect(e)) throw e;
			if (isHttpError(e)) throw e;
			if (e instanceof ApiError) {
				return fail(e.status, { error: e.message });
			}
			return fail(500, { error: 'Failed to delete ticketing configuration' });
		}
	}
};
