import type { PageServerLoad } from './$types';
import { error, isHttpError, redirect } from '@sveltejs/kit';
import { getNhiRiskSummary, detectInactiveNhis, detectOrphanNhis } from '$lib/api/nhi-governance';
import { listNhi } from '$lib/api/nhi';
import { ApiError } from '$lib/api/client';
import { hasAdminRole } from '$lib/server/auth';

export const load: PageServerLoad = async ({ locals, fetch }) => {
	if (!hasAdminRole(locals.user?.roles)) {
		redirect(302, '/dashboard');
	}

	try {
		const [riskSummary, inactiveEntities, orphanEntities, nhiList] = await Promise.all([
			getNhiRiskSummary(locals.accessToken!, locals.tenantId!, fetch),
			detectInactiveNhis(locals.accessToken!, locals.tenantId!, fetch),
			detectOrphanNhis(locals.accessToken!, locals.tenantId!, fetch),
			listNhi({ limit: 200, offset: 0 }, locals.accessToken!, locals.tenantId!, fetch)
		]);

		// Build id→name map for SoD rules display
		const nhiNameMap: Record<string, string> = {};
		for (const entity of nhiList.data) {
			nhiNameMap[entity.id] = entity.name;
		}

		return { riskSummary, inactiveEntities, orphanEntities, nhiNameMap };
	} catch (e) {
		if (isHttpError(e)) throw e;
		if (e instanceof ApiError) {
			error(e.status, e.message);
		}
		error(500, 'Failed to load NHI governance data');
	}
};
