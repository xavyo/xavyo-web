import type { PageServerLoad, Actions } from './$types';
import { hasAdminRole } from '$lib/server/auth';
import { redirect, fail, isRedirect } from '@sveltejs/kit';
import {
	getSiemDestination,
	getSiemHealthSummary,
	listSiemDeadLetter,
	testSiemDestination,
	updateSiemDestination,
	deleteSiemDestination
} from '$lib/api/siem';
import { ApiError } from '$lib/api/client';

export const load: PageServerLoad = async ({ params, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) {
		redirect(302, '/login');
	}
	if (!hasAdminRole(locals.user?.roles)) {
		redirect(302, '/');
	}

	const destination = await getSiemDestination(
		params.id,
		locals.accessToken,
		locals.tenantId,
		fetch
	);

	const [health, deadLetter] = await Promise.all([
		getSiemHealthSummary(params.id, locals.accessToken, locals.tenantId, fetch).catch(() => null),
		listSiemDeadLetter(
			params.id,
			{ limit: 20, offset: 0 },
			locals.accessToken,
			locals.tenantId,
			fetch
		).catch(() => ({
			items: [],
			total: 0,
			limit: 20,
			offset: 0
		}))
	]);

	return { destination, health, deadLetter };
};

export const actions: Actions = {
	test: async ({ params, locals, fetch }) => {
		if (!locals.accessToken || !locals.tenantId) {
			redirect(302, '/login');
		}
		try {
			const result = await testSiemDestination(
				params.id,
				locals.accessToken,
				locals.tenantId,
				fetch
			);
			return { success: true, testResult: result };
		} catch (e) {
			if (isRedirect(e)) throw e;
			if (e instanceof ApiError) return fail(e.status, { error: e.message });
			return fail(500, { error: 'Failed to test connection' });
		}
	},

	enable: async ({ params, locals, fetch }) => {
		if (!locals.accessToken || !locals.tenantId) {
			redirect(302, '/login');
		}
		try {
			await updateSiemDestination(
				params.id,
				{ enabled: true },
				locals.accessToken,
				locals.tenantId,
				fetch
			);
			return { success: true };
		} catch (e) {
			if (isRedirect(e)) throw e;
			if (e instanceof ApiError) return fail(e.status, { error: e.message });
			return fail(500, { error: 'Failed to enable destination' });
		}
	},

	disable: async ({ params, locals, fetch }) => {
		if (!locals.accessToken || !locals.tenantId) {
			redirect(302, '/login');
		}
		try {
			await updateSiemDestination(
				params.id,
				{ enabled: false },
				locals.accessToken,
				locals.tenantId,
				fetch
			);
			return { success: true };
		} catch (e) {
			if (isRedirect(e)) throw e;
			if (e instanceof ApiError) return fail(e.status, { error: e.message });
			return fail(500, { error: 'Failed to disable destination' });
		}
	},

	delete: async ({ params, locals, fetch }) => {
		if (!locals.accessToken || !locals.tenantId) {
			redirect(302, '/login');
		}
		try {
			await deleteSiemDestination(params.id, locals.accessToken, locals.tenantId, fetch);
			redirect(302, '/governance/siem');
		} catch (e) {
			if (isRedirect(e)) throw e;
			if (e instanceof ApiError) return fail(e.status, { error: e.message });
			return fail(500, { error: 'Failed to delete destination' });
		}
	}
};
