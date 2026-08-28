import type { Actions, PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';
import { listDlqEntries, replayDlqEntry, deleteDlqEntry } from '$lib/api/webhooks';
import { ApiError } from '$lib/api/client';
import { listPagination } from '$lib/server/list-pagination';

export const load: PageServerLoad = async ({ url, locals, fetch }) => {
	const { limit = 20, offset = 0 } = listPagination(url);

	try {
		const result = await listDlqEntries(
			{ limit, offset },
			locals.accessToken!,
			locals.tenantId!,
			fetch
		);
		return { entries: result.entries, total: result.total, limit, offset };
	} catch (e) {
		if (e instanceof ApiError) error(e.status, e.message);
		error(500, 'Failed to load webhook DLQ');
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
