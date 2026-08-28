import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getExpiringLicensePools } from '$lib/api/licenses';
import { ApiError } from '$lib/api/client';
import { finiteNumber } from '$lib/server/list-pagination';

export const GET: RequestHandler = async ({ url, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) {
		error(401, 'Unauthorized');
	}

	try {
		const withinDays = finiteNumber(url.searchParams.get('within_days'));

		const result = await getExpiringLicensePools(
			withinDays,
			locals.accessToken,
			locals.tenantId,
			fetch
		);
		return json(result);
	} catch (e) {
		if (e instanceof ApiError) {
			return json({ error: e.message }, { status: e.status });
		}
		return json({ error: 'Failed to get expiring license pools' }, { status: 500 });
	}
};
