import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { listDiscrepancies } from '$lib/api/reconciliation';
import { listPagination } from '$lib/server/list-pagination';

export const GET: RequestHandler = async ({ params, url, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) {
		error(401, 'Unauthorized');
	}

	const run_id = url.searchParams.get('run_id') ?? undefined;
	const discrepancy_type = url.searchParams.get('discrepancy_type') ?? undefined;
	const resolution_status = url.searchParams.get('resolution_status') ?? undefined;
	const identity_id = url.searchParams.get('identity_id') ?? undefined;
	const external_uid = url.searchParams.get('external_uid') ?? undefined;

	const result = await listDiscrepancies(
		params.id,
		{ run_id, discrepancy_type, resolution_status, identity_id, external_uid, ...listPagination(url) },
		locals.accessToken,
		locals.tenantId,
		fetch
	);

	return json(result);
};
