import type { Actions, PageServerLoad } from './$types';
import { error, fail, redirect } from '@sveltejs/kit';
import { hasAdminRole } from '$lib/server/auth';
import { getDetectionRule, deleteDetectionRule, enableDetectionRule, disableDetectionRule } from '$lib/api/detection-rules';
import { ApiError } from '$lib/api/client';

export const load: PageServerLoad = async ({ params, locals, fetch }) => {
	if (!hasAdminRole(locals.user?.roles)) {
		redirect(302, '/dashboard');
	}

	let rule;
	try {
		rule = await getDetectionRule(params.id, locals.accessToken!, locals.tenantId!, fetch);
	} catch (e) {
		if (e instanceof ApiError) error(e.status, e.message);
		error(500, 'Failed to load detection rule');
	}

	return { rule };
};

export const actions: Actions = {
	enable: async ({ params, locals, fetch }) => {
		try {
			await enableDetectionRule(params.id, locals.accessToken!, locals.tenantId!, fetch);
		} catch (e) {
			if (e instanceof ApiError) return fail(e.status, { error: e.message });
			return fail(500, { error: 'Failed to enable rule' });
		}
		return { success: true, action: 'enabled' };
	},

	disable: async ({ params, locals, fetch }) => {
		try {
			await disableDetectionRule(params.id, locals.accessToken!, locals.tenantId!, fetch);
		} catch (e) {
			if (e instanceof ApiError) return fail(e.status, { error: e.message });
			return fail(500, { error: 'Failed to disable rule' });
		}
		return { success: true, action: 'disabled' };
	},

	delete: async ({ params, locals, fetch }) => {
		try {
			await deleteDetectionRule(params.id, locals.accessToken!, locals.tenantId!, fetch);
		} catch (e) {
			if (e instanceof ApiError) return fail(e.status, { error: e.message });
			return fail(500, { error: 'Failed to delete rule' });
		}
		redirect(302, '/governance/detection-rules');
	}
};
