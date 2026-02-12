import type { Actions, PageServerLoad } from './$types';
import { error, fail, redirect } from '@sveltejs/kit';
import { hasAdminRole } from '$lib/server/auth';
import { getRun, getRunReport, cancelRun, resumeRun } from '$lib/api/reconciliation';
import { ApiError } from '$lib/api/client';

export const load: PageServerLoad = async ({ params, locals, fetch }) => {
	if (!hasAdminRole(locals.user?.roles)) {
		redirect(302, '/dashboard');
	}

	try {
		const run = await getRun(params.id, params.runId, locals.accessToken!, locals.tenantId!, fetch);
		const report = run.status === 'completed'
			? await getRunReport(params.id, params.runId, locals.accessToken!, locals.tenantId!, fetch).catch(() => null)
			: null;
		return { run, report, connectorId: params.id };
	} catch (e) {
		if (e instanceof ApiError) error(e.status, e.message);
		error(500, 'Failed to load run');
	}
};

export const actions: Actions = {
	cancel: async ({ params, locals, fetch }) => {
		try {
			await cancelRun(params.id, params.runId, locals.accessToken!, locals.tenantId!, fetch);
		} catch (e) {
			if (e instanceof ApiError) return fail(e.status, { error: e.message });
			return fail(500, { error: 'An unexpected error occurred' });
		}
		return { success: true, action: 'cancelled' };
	},
	resume: async ({ params, locals, fetch }) => {
		try {
			await resumeRun(params.id, params.runId, locals.accessToken!, locals.tenantId!, fetch);
		} catch (e) {
			if (e instanceof ApiError) return fail(e.status, { error: e.message });
			return fail(500, { error: 'An unexpected error occurred' });
		}
		return { success: true, action: 'resumed' };
	}
};
