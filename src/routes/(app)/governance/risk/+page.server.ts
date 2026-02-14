import type { Actions, PageServerLoad } from './$types';
import { fail, redirect, isRedirect, isHttpError } from '@sveltejs/kit';
import { hasAdminRole } from '$lib/server/auth';
import { listRiskAlerts, getRiskAlertSummary, acknowledgeRiskAlert, deleteRiskAlert } from '$lib/api/risk';
import { ApiError } from '$lib/api/client';

export const load: PageServerLoad = async ({ url, locals, fetch }) => {
	if (!hasAdminRole(locals.user?.roles)) {
		redirect(302, '/dashboard');
	}

	const severity = url.searchParams.get('severity') ?? undefined;
	const acknowledged_str = url.searchParams.get('acknowledged');
	const acknowledged = acknowledged_str === 'true' ? true : acknowledged_str === 'false' ? false : undefined;
	const limit = Number(url.searchParams.get('limit') ?? '50');
	const offset = Number(url.searchParams.get('offset') ?? '0');

	const [alerts, summary] = await Promise.all([
		listRiskAlerts(
			{ severity, acknowledged, limit, offset },
			locals.accessToken!, locals.tenantId!, fetch
		).catch(() => ({ items: [], total: 0, limit, offset })),
		getRiskAlertSummary(locals.accessToken!, locals.tenantId!, fetch)
			.catch(() => ({ unacknowledged: [], total_unacknowledged: 0 }))
	]);

	return { alerts, summary, filters: { severity, acknowledged } };
};

export const actions: Actions = {
	acknowledge: async ({ request, locals, fetch }) => {
		const formData = await request.formData();
		const id = formData.get('id') as string;
		try {
			await acknowledgeRiskAlert(id, locals.accessToken!, locals.tenantId!, fetch);
		} catch (e) {
			if (isRedirect(e)) throw e;
			if (isHttpError(e)) throw e;
			if (e instanceof ApiError) return fail(e.status, { error: e.message });
			return fail(500, { error: 'Failed to acknowledge alert' });
		}
		return { success: true, action: 'acknowledged' };
	},

	delete: async ({ request, locals, fetch }) => {
		const formData = await request.formData();
		const id = formData.get('id') as string;
		try {
			await deleteRiskAlert(id, locals.accessToken!, locals.tenantId!, fetch);
		} catch (e) {
			if (isRedirect(e)) throw e;
			if (isHttpError(e)) throw e;
			if (e instanceof ApiError) return fail(e.status, { error: e.message });
			return fail(500, { error: 'Failed to delete alert' });
		}
		return { success: true, action: 'deleted' };
	}
};
