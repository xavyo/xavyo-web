import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getStalenessReport } from '$lib/api/nhi-governance';
import { ApiError } from '$lib/api/client';
import { finiteNumber } from '$lib/server/list-pagination';

export const GET: RequestHandler = async ({ locals, fetch, url }) => {
	if (!locals.accessToken || !locals.tenantId) {
		error(401, 'Unauthorized');
	}

	const minDays = finiteNumber(url.searchParams.get('min_inactive_days'));

	try {
		const result = await getStalenessReport(
			locals.accessToken,
			locals.tenantId,
			fetch,
			minDays
		);
		return json(result);
	} catch (e) {
		if (e instanceof ApiError) error(e.status, e.message);
		throw e;
	}
};
