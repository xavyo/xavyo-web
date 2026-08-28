import type { Actions, PageServerLoad } from './$types';
import { error, fail } from '@sveltejs/kit';
import { getRun, getRunReport, cancelRun, resumeRun } from '$lib/api/reconciliation';
import { ApiError } from '$lib/api/client';

export const load: PageServerLoad = async ({ params, locals, fetch }) => {

	try {
		const run = await getRun(params.id, params.runId, locals.accessToken!, locals.tenantId!, fetch);
		let report = null;
		if (run.status === 'completed') {
			try {
				report = await getRunReport(
					params.id,
					params.runId,
					locals.accessToken!,
					locals.tenantId!,
					fetch
				);
			} catch (reportErr) {
				if (!(reportErr instanceof ApiError && reportErr.status === 404)) {
					if (reportErr instanceof ApiError) error(reportErr.status, reportErr.message);
					error(500, 'Failed to load reconciliation report');
				}
			}
		}
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
