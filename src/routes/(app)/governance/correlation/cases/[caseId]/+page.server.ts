import type { PageServerLoad } from './$types';
import { error, isHttpError } from '@sveltejs/kit';
import { hasAdminRole } from '$lib/server/auth';
import { getCorrelationCase } from '$lib/api/correlation';
import { ApiError } from '$lib/api/client';

export const load: PageServerLoad = async ({ params, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) error(401, 'Unauthorized');
	if (!hasAdminRole(locals.user?.roles)) error(403, 'Admin role required');

	try {
		const caseDetail = await getCorrelationCase(
			params.caseId,
			locals.accessToken,
			locals.tenantId,
			fetch
		);
		return { caseDetail };
	} catch (e) {
		if (isHttpError(e)) throw e;
		if (e instanceof ApiError) {
			if (e.status === 404) {
				error(404, 'Correlation case not found');
			}
			error(e.status, e.message);
		}
		error(500, 'Failed to load correlation case');
	}
};
