import type { Actions, PageServerLoad } from './$types';
import { fail, redirect } from '@sveltejs/kit';
import { hasAdminRole } from '$lib/server/auth';
import { listDetectionRules, deleteDetectionRule, enableDetectionRule, disableDetectionRule, seedDefaultRules } from '$lib/api/detection-rules';
import { ApiError } from '$lib/api/client';

export const load: PageServerLoad = async ({ url, locals, fetch }) => {
	if (!hasAdminRole(locals.user?.roles)) {
		redirect(302, '/dashboard');
	}

	const rule_type = url.searchParams.get('rule_type') ?? undefined;
	const is_enabled_str = url.searchParams.get('is_enabled');
	const is_enabled = is_enabled_str === 'true' ? true : is_enabled_str === 'false' ? false : undefined;
	const limit = Number(url.searchParams.get('limit') ?? '50');
	const offset = Number(url.searchParams.get('offset') ?? '0');

	const rules = await listDetectionRules(
		{ rule_type, is_enabled, limit, offset },
		locals.accessToken!, locals.tenantId!, fetch
	).catch(() => ({ items: [], total: 0, limit, offset }));

	return { rules, filters: { rule_type, is_enabled } };
};

export const actions: Actions = {
	delete: async ({ request, locals, fetch }) => {
		const formData = await request.formData();
		const id = formData.get('id') as string;
		try {
			await deleteDetectionRule(id, locals.accessToken!, locals.tenantId!, fetch);
		} catch (e) {
			if (e instanceof ApiError) return fail(e.status, { error: e.message });
			return fail(500, { error: 'Failed to delete rule' });
		}
		return { success: true, action: 'deleted' };
	},

	enable: async ({ request, locals, fetch }) => {
		const formData = await request.formData();
		const id = formData.get('id') as string;
		try {
			await enableDetectionRule(id, locals.accessToken!, locals.tenantId!, fetch);
		} catch (e) {
			if (e instanceof ApiError) return fail(e.status, { error: e.message });
			return fail(500, { error: 'Failed to enable rule' });
		}
		return { success: true, action: 'enabled' };
	},

	disable: async ({ request, locals, fetch }) => {
		const formData = await request.formData();
		const id = formData.get('id') as string;
		try {
			await disableDetectionRule(id, locals.accessToken!, locals.tenantId!, fetch);
		} catch (e) {
			if (e instanceof ApiError) return fail(e.status, { error: e.message });
			return fail(500, { error: 'Failed to disable rule' });
		}
		return { success: true, action: 'disabled' };
	},

	seed: async ({ locals, fetch }) => {
		try {
			await seedDefaultRules(locals.accessToken!, locals.tenantId!, fetch);
		} catch (e) {
			if (e instanceof ApiError) return fail(e.status, { error: e.message });
			return fail(500, { error: 'Failed to seed default rules' });
		}
		return { success: true, action: 'seeded' };
	}
};
