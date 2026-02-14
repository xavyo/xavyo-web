import type { Actions, PageServerLoad } from './$types';
import { fail, redirect, isRedirect, isHttpError } from '@sveltejs/kit';
import { hasAdminRole } from '$lib/server/auth';
import {
	listRiskThresholds,
	deleteRiskThreshold,
	enableRiskThreshold,
	disableRiskThreshold
} from '$lib/api/risk';
import { ApiError } from '$lib/api/client';

export const load: PageServerLoad = async ({ url, locals, fetch }) => {
	if (!hasAdminRole(locals.user?.roles)) {
		redirect(302, '/dashboard');
	}

	const severity = url.searchParams.get('severity') ?? undefined;
	const is_enabled_str = url.searchParams.get('is_enabled');
	const is_enabled =
		is_enabled_str === 'true' ? true : is_enabled_str === 'false' ? false : undefined;
	const limit = Number(url.searchParams.get('limit') ?? '50');
	const offset = Number(url.searchParams.get('offset') ?? '0');

	const thresholds = await listRiskThresholds(
		{ severity, is_enabled, limit, offset },
		locals.accessToken!,
		locals.tenantId!,
		fetch
	).catch(() => ({ items: [], total: 0, limit, offset }));

	return { thresholds, filters: { severity, is_enabled } };
};

export const actions: Actions = {
	delete: async ({ request, locals, fetch }) => {
		const formData = await request.formData();
		const id = formData.get('id') as string;
		try {
			await deleteRiskThreshold(id, locals.accessToken!, locals.tenantId!, fetch);
		} catch (e) {
			if (isRedirect(e)) throw e;
			if (isHttpError(e)) throw e;
			if (e instanceof ApiError) return fail(e.status, { error: e.message });
			return fail(500, { error: 'Failed to delete threshold' });
		}
		return { success: true, action: 'deleted' };
	},

	enable: async ({ request, locals, fetch }) => {
		const formData = await request.formData();
		const id = formData.get('id') as string;
		try {
			await enableRiskThreshold(id, locals.accessToken!, locals.tenantId!, fetch);
		} catch (e) {
			if (isRedirect(e)) throw e;
			if (isHttpError(e)) throw e;
			if (e instanceof ApiError) return fail(e.status, { error: e.message });
			return fail(500, { error: 'Failed to enable threshold' });
		}
		return { success: true, action: 'enabled' };
	},

	disable: async ({ request, locals, fetch }) => {
		const formData = await request.formData();
		const id = formData.get('id') as string;
		try {
			await disableRiskThreshold(id, locals.accessToken!, locals.tenantId!, fetch);
		} catch (e) {
			if (isRedirect(e)) throw e;
			if (isHttpError(e)) throw e;
			if (e instanceof ApiError) return fail(e.status, { error: e.message });
			return fail(500, { error: 'Failed to disable threshold' });
		}
		return { success: true, action: 'disabled' };
	}
};
