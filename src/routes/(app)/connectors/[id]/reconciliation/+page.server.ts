import type { Actions, PageServerLoad } from './$types';
import { fail, redirect } from '@sveltejs/kit';
import { hasAdminRole } from '$lib/server/auth';
import { listRuns, triggerRun } from '$lib/api/reconciliation';
import { getConnector } from '$lib/api/connectors';
import { ApiError } from '$lib/api/client';

export const load: PageServerLoad = async ({ params, url, locals, fetch }) => {
	if (!hasAdminRole(locals.user?.roles)) {
		redirect(302, '/dashboard');
	}

	const mode = url.searchParams.get('mode') ?? undefined;
	const status = url.searchParams.get('status') ?? undefined;
	const limit = Number(url.searchParams.get('limit') ?? '20');
	const offset = Number(url.searchParams.get('offset') ?? '0');

	try {
		const [runs, connector] = await Promise.all([
			listRuns(params.id, { mode, status, limit, offset }, locals.accessToken!, locals.tenantId!, fetch),
			getConnector(params.id, locals.accessToken!, locals.tenantId!, fetch).catch(() => null)
		]);
		return { runs, connector, connectorId: params.id };
	} catch {
		return { runs: { runs: [], total: 0, limit, offset }, connector: null, connectorId: params.id };
	}
};

export const actions: Actions = {
	trigger: async ({ params, request, locals, fetch }) => {
		const formData = await request.formData();
		const mode = (formData.get('mode') as string) || 'full';
		const dry_run = formData.get('dry_run') === 'on';
		try {
			await triggerRun(params.id, { mode: mode as 'full' | 'delta', dry_run }, locals.accessToken!, locals.tenantId!, fetch);
		} catch (e) {
			if (e instanceof ApiError) return fail(e.status, { error: e.message });
			return fail(500, { error: 'An unexpected error occurred' });
		}
		return { success: true, action: 'triggered' };
	}
};
