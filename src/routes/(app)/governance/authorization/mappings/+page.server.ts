import type { Actions, PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';
import { listMappings, deleteMapping } from '$lib/api/authorization';
import { ApiError } from '$lib/api/client';
import { listPagination } from '$lib/server/list-pagination';

export const load: PageServerLoad = async ({ url, locals, fetch }) => {

	const { limit = 20, offset = 0 } = listPagination(url);

	try {
		const result = await listMappings(
			{ limit, offset },
			locals.accessToken!,
			locals.tenantId!,
			fetch
		);
		return { mappings: result.items, total: result.total, limit, offset };
	} catch (e) {
		if (e instanceof ApiError) error(e.status, e.message);
		error(500, 'Failed to load authorization mappings');
	}
};

export const actions: Actions = {
	delete: async ({ request, locals, fetch }) => {
		const formData = await request.formData();
		const id = formData.get('id') as string;
		if (!id) return { success: false, error: 'Missing mapping ID' };

		try {
			await deleteMapping(id, locals.accessToken!, locals.tenantId!, fetch);
			return { success: true, action: 'delete' };
		} catch (e) {
			if (e instanceof ApiError) {
				return { success: false, error: e.message };
			}
			return { success: false, error: 'Failed to delete mapping' };
		}
	}
};
