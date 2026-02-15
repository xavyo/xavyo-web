import type { Actions, PageServerLoad } from './$types';
import { getDelegationGrant, revokeDelegationGrant } from '$lib/api/nhi-delegations';
import { hasAdminRole } from '$lib/server/auth';
import { error, redirect } from '@sveltejs/kit';
import { isRedirect } from '@sveltejs/kit';
import { ApiError } from '$lib/api/client';

export const load: PageServerLoad = async ({ locals, params, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) throw error(401, 'Unauthorized');
	try {
		const grant = await getDelegationGrant(params.id, locals.accessToken, locals.tenantId, fetch);
		return {
			grant,
			isAdmin: hasAdminRole(locals.user?.roles)
		};
	} catch (e) {
		if (e instanceof ApiError) throw error(e.status, e.message);
		throw error(500, 'Failed to load delegation grant');
	}
};

export const actions: Actions = {
	revoke: async ({ locals, params, fetch }) => {
		if (!locals.accessToken || !locals.tenantId) throw error(401);
		if (!hasAdminRole(locals.user?.roles)) throw error(403);
		try {
			await revokeDelegationGrant(params.id, {}, locals.accessToken, locals.tenantId, fetch);
			redirect(303, `/nhi/delegations/${params.id}`);
		} catch (e) {
			if (isRedirect(e)) throw e;
			if (e instanceof ApiError) throw error(e.status, e.message);
			throw error(500, 'Failed to revoke delegation grant');
		}
	}
};
