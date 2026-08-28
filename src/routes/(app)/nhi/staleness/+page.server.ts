import type { PageServerLoad } from './$types';
import { getNhiStalenessReport } from '$lib/api/nhi-usage';
import { error } from '@sveltejs/kit';
import { ApiError } from '$lib/api/client';

export const load: PageServerLoad = async ({ locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) throw error(401, 'Unauthorized');

	try {
		const result = await getNhiStalenessReport(
			{ limit: 50 },
			locals.accessToken,
			locals.tenantId,
			fetch
		);
		return { entries: result.items, total: result.total };
	} catch (e) {
		if (e instanceof ApiError) error(e.status, e.message);
		error(500, 'Failed to load NHI staleness report');
	}
};
