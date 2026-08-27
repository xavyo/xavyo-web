import type { Actions, PageServerLoad } from './$types';
import { error, redirect, isRedirect, fail } from '@sveltejs/kit';
import { getPeerGroup, deletePeerGroup, refreshPeerGroup } from '$lib/api/peer-groups';
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
		const group = await getPeerGroup(params.id, locals.accessToken, locals.tenantId, fetch);
		return { group };
	} catch (e) {
		if (e instanceof ApiError && e.status === 404) {
			error(404, 'Peer group not found');
		}
		throw e;
	}
};

export const actions: Actions = {
	delete: async ({ params, locals, fetch }) => {
		if (!locals.accessToken || !locals.tenantId) {
			redirect(302, '/login');
		}
		try {
			await deletePeerGroup(params.id, locals.accessToken, locals.tenantId, fetch);
		} catch (e) {
			if (isRedirect(e)) throw e;
			if (e instanceof ApiError) {
				const status = e.status >= 400 && e.status < 600 ? e.status : 400;
				return fail(status, { error: e.message });
			}
			return fail(500, { error: 'An unexpected error occurred' });
		}
		redirect(302, '/governance/peer-groups');
	},
	refresh: async ({ params, locals, fetch }) => {
		if (!locals.accessToken || !locals.tenantId) {
			redirect(302, '/login');
		}
		try {
			const result = await refreshPeerGroup(params.id, locals.accessToken, locals.tenantId, fetch);
			return { success: true, group: result.group, member_count: result.member_count };
		} catch (e) {
			if (isRedirect(e)) throw e;
			if (e instanceof ApiError) {
				const status = e.status >= 400 && e.status < 600 ? e.status : 400;
				return fail(status, { error: e.message });
			}
			return fail(500, { error: 'An unexpected error occurred' });
		}
	}
};
