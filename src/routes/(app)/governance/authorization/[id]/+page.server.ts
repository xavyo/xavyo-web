import type { Actions, PageServerLoad } from './$types';
import { error, fail, redirect } from '@sveltejs/kit';
import { hasAdminRole } from '$lib/server/auth';
import { getPolicy, updatePolicy, deletePolicy } from '$lib/api/authorization';
import { ApiError } from '$lib/api/client';

export const load: PageServerLoad = async ({ params, locals, fetch }) => {
	if (!hasAdminRole(locals.user?.roles)) {
		redirect(302, '/dashboard');
	}

	try {
		const policy = await getPolicy(params.id, locals.accessToken!, locals.tenantId!, fetch);
		return { policy };
	} catch (e) {
		if (e instanceof ApiError) {
			error(e.status, e.message);
		}
		error(500, 'Failed to load policy');
	}
};

export const actions: Actions = {
	enable: async ({ params, locals, fetch }) => {
		try {
			await updatePolicy(
				params.id,
				{ status: 'active' },
				locals.accessToken!,
				locals.tenantId!,
				fetch
			);
		} catch (e) {
			if (e instanceof ApiError) {
				return fail(e.status, { error: e.message });
			}
			return fail(500, { error: 'An unexpected error occurred' });
		}
		return { success: true, action: 'enabled' };
	},

	disable: async ({ params, locals, fetch }) => {
		try {
			await updatePolicy(
				params.id,
				{ status: 'inactive' },
				locals.accessToken!,
				locals.tenantId!,
				fetch
			);
		} catch (e) {
			if (e instanceof ApiError) {
				return fail(e.status, { error: e.message });
			}
			return fail(500, { error: 'An unexpected error occurred' });
		}
		return { success: true, action: 'disabled' };
	},

	delete: async ({ params, locals, fetch }) => {
		try {
			await deletePolicy(params.id, locals.accessToken!, locals.tenantId!, fetch);
		} catch (e) {
			if (e instanceof ApiError) {
				return fail(e.status, { error: e.message });
			}
			return fail(500, { error: 'An unexpected error occurred' });
		}
		redirect(302, '/governance/authorization');
	}
};
