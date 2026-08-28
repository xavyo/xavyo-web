import type { Actions, PageServerLoad } from './$types';
import { error, fail, isRedirect, isHttpError } from '@sveltejs/kit';
import { listRiskAlerts, getRiskAlertSummary, acknowledgeRiskAlert, deleteRiskAlert } from '$lib/api/risk';
import { ApiError } from '$lib/api/client';
import { listPagination } from '$lib/server/list-pagination';

export const load: PageServerLoad = async ({ url, locals, fetch }) => {
	const severity = url.searchParams.get('severity') ?? undefined;
	const acknowledged_str = url.searchParams.get('acknowledged');
	const acknowledged = acknowledged_str === 'true' ? true : acknowledged_str === 'false' ? false : undefined;
	const { limit = 50, offset = 0 } = listPagination(url);

	try {
		const [alerts, summary] = await Promise.all([
			listRiskAlerts(
				{ severity, acknowledged, limit, offset },
				locals.accessToken!,
				locals.tenantId!,
				fetch
			),
			getRiskAlertSummary(locals.accessToken!, locals.tenantId!, fetch)
		]);
		return { alerts, summary, filters: { severity, acknowledged } };
	} catch (e) {
		if (e instanceof ApiError) error(e.status, e.message);
		error(500, 'Failed to load risk alerts');
	}
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
