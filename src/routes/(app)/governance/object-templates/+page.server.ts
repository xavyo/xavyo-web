import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';
import { listObjectTemplates } from '$lib/api/object-templates';
import { ApiError } from '$lib/api/client';
import { listPagination } from '$lib/server/list-pagination';

export const load: PageServerLoad = async ({ locals, url }) => {

	const object_type = url.searchParams.get('object_type') || undefined;
	const status = url.searchParams.get('status') || undefined;
	const { limit = 20, offset = 0 } = listPagination(url);

	try {
		const result = await listObjectTemplates(
			{ object_type, status, offset, limit },
			locals.accessToken!,
			locals.tenantId!
		);
		return {
			templates: result.items,
			total: result.total,
			offset,
			limit,
			filters: { object_type: object_type || '', status: status || '' }
		};
	} catch (e) {
		if (e instanceof ApiError) error(e.status, e.message);
		error(500, 'Failed to load object templates');
	}
};
