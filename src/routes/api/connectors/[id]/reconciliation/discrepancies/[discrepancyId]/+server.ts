import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getDiscrepancy } from '$lib/api/reconciliation';

export const GET: RequestHandler = async ({ params, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) {
		error(401, 'Unauthorized');
	}

	const result = await getDiscrepancy(
		params.id,
		params.discrepancyId,
		locals.accessToken,
		locals.tenantId,
		fetch
	);

	return json(result);
};
