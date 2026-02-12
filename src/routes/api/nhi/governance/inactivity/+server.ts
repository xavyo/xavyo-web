import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getStalenessReport } from '$lib/api/nhi-governance';
import { ApiError } from '$lib/api/client';
import { hasAdminRole } from '$lib/server/auth';

export const GET: RequestHandler = async ({ locals, fetch, url }) => {
	if (!locals.accessToken || !locals.tenantId) {
		error(401, 'Unauthorized');
	}
	if (!hasAdminRole(locals.user?.roles)) {
		error(403, 'Forbidden');
	}

	const minDays = url.searchParams.get('min_inactive_days');

	try {
		const result = await getStalenessReport(
			locals.accessToken,
			locals.tenantId,
			fetch,
			minDays ? parseInt(minDays, 10) : undefined
		);
		return json(result);
	} catch (e) {
		if (e instanceof ApiError) error(e.status, e.message);
		throw e;
	}
};
