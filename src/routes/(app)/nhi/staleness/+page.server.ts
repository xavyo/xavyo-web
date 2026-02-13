import type { PageServerLoad } from './$types';
import { getNhiStalenessReport } from '$lib/api/nhi-usage';
import { hasAdminRole } from '$lib/server/auth';
import { error } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) throw error(401, 'Unauthorized');
	if (!hasAdminRole(locals.user?.roles)) throw error(403, 'Forbidden');

	try {
		const result = await getNhiStalenessReport({ limit: 50 }, locals.accessToken, locals.tenantId, fetch);
		return { entries: result.items, total: result.total };
	} catch {
		return { entries: [], total: 0 };
	}
};
