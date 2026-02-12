import type { Actions, PageServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';
import { hasAdminRole } from '$lib/server/auth';
import { listDlqEntries, replayDlqEntry, deleteDlqEntry } from '$lib/api/webhooks';
import { ApiError } from '$lib/api/client';

export const load: PageServerLoad = async ({ url, locals, fetch }) => {
	if (!hasAdminRole(locals.user?.roles)) {
		redirect(302, '/dashboard');
	}

	const limit = Number(url.searchParams.get('limit') ?? '20');
	const offset = Number(url.searchParams.get('offset') ?? '0');

	try {
		const result = await listDlqEntries(
			{ limit, offset },
			locals.accessToken!,
			locals.tenantId!,
			fetch
		);
		return { entries: result.entries, total: result.total, limit, offset };
	} catch {
		return { entries: [], total: 0, limit, offset };
	}
};

export const actions: Actions = {
	replay: async ({ request, locals, fetch }) => {
		const formData = await request.formData();
		const id = formData.get('id') as string;
		if (!id) return { success: false, error: 'Missing DLQ entry ID' };

		try {
			await replayDlqEntry(id, locals.accessToken!, locals.tenantId!, fetch);
			return { success: true, action: 'replay' };
		} catch (e) {
			if (e instanceof ApiError) {
				return { success: false, error: e.message };
			}
			return { success: false, error: 'Failed to replay DLQ entry' };
		}
	},
	delete: async ({ request, locals, fetch }) => {
		const formData = await request.formData();
		const id = formData.get('id') as string;
		if (!id) return { success: false, error: 'Missing DLQ entry ID' };

		try {
			await deleteDlqEntry(id, locals.accessToken!, locals.tenantId!, fetch);
			return { success: true, action: 'delete' };
		} catch (e) {
			if (e instanceof ApiError) {
				return { success: false, error: e.message };
			}
			return { success: false, error: 'Failed to delete DLQ entry' };
		}
	}
};
