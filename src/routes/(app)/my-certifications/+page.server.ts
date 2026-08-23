import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';
import { listMyCertifications } from '$lib/api/my-certifications';
import { ApiError } from '$lib/api/client';

export const load: PageServerLoad = async ({ locals, fetch, url }) => {
	if (!locals.accessToken || !locals.tenantId) error(401, 'Unauthorized');

	const status = url.searchParams.get('status') ?? 'pending';
	const page = Number(url.searchParams.get('page') ?? '1');
	const page_size = Number(url.searchParams.get('page_size') ?? '20');

	try {
		const result = await listMyCertifications(
			{ status: status || undefined, page, page_size },
			locals.accessToken,
			locals.tenantId,
			fetch
		);
		return {
			items: result.items,
			total: result.total,
			status,
			page,
			page_size
		};
	} catch (e) {
		if (e instanceof ApiError && e.status === 403) error(403, 'Forbidden');
		if (e instanceof ApiError && e.status === 401) error(401, 'Unauthorized');
		error(502, 'Failed to load certifications');
	}
};
