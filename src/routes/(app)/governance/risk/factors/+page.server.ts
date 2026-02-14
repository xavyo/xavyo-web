import type { Actions, PageServerLoad } from './$types';
import { fail, redirect, isRedirect, isHttpError } from '@sveltejs/kit';
import { hasAdminRole } from '$lib/server/auth';
import {
	listRiskFactors,
	deleteRiskFactor,
	enableRiskFactor,
	disableRiskFactor
} from '$lib/api/risk';
import { ApiError } from '$lib/api/client';

export const load: PageServerLoad = async ({ url, locals, fetch }) => {
	if (!hasAdminRole(locals.user?.roles)) {
		redirect(302, '/dashboard');
	}

	const category = url.searchParams.get('category') ?? undefined;
	const is_enabled_str = url.searchParams.get('is_enabled');
	const is_enabled =
		is_enabled_str === 'true' ? true : is_enabled_str === 'false' ? false : undefined;
	const limit = Number(url.searchParams.get('limit') ?? '50');
	const offset = Number(url.searchParams.get('offset') ?? '0');

	const factors = await listRiskFactors(
		{ category, is_enabled, limit, offset },
		locals.accessToken!,
		locals.tenantId!,
		fetch
	).catch(() => ({ items: [], total: 0, limit, offset }));

	return { factors, filters: { category, is_enabled } };
};

export const actions: Actions = {
	delete: async ({ request, locals, fetch }) => {
		const formData = await request.formData();
		const id = formData.get('id') as string;
		try {
			await deleteRiskFactor(id, locals.accessToken!, locals.tenantId!, fetch);
		} catch (e) {
			if (isRedirect(e)) throw e;
			if (isHttpError(e)) throw e;
			if (e instanceof ApiError) return fail(e.status, { error: e.message });
			return fail(500, { error: 'Failed to delete factor' });
		}
		return { success: true, action: 'deleted' };
	},

	enable: async ({ request, locals, fetch }) => {
		const formData = await request.formData();
		const id = formData.get('id') as string;
		try {
			await enableRiskFactor(id, locals.accessToken!, locals.tenantId!, fetch);
		} catch (e) {
			if (isRedirect(e)) throw e;
			if (isHttpError(e)) throw e;
			if (e instanceof ApiError) return fail(e.status, { error: e.message });
			return fail(500, { error: 'Failed to enable factor' });
		}
		return { success: true, action: 'enabled' };
	},

	disable: async ({ request, locals, fetch }) => {
		const formData = await request.formData();
		const id = formData.get('id') as string;
		try {
			await disableRiskFactor(id, locals.accessToken!, locals.tenantId!, fetch);
		} catch (e) {
			if (isRedirect(e)) throw e;
			if (isHttpError(e)) throw e;
			if (e instanceof ApiError) return fail(e.status, { error: e.message });
			return fail(500, { error: 'Failed to disable factor' });
		}
		return { success: true, action: 'disabled' };
	}
};
