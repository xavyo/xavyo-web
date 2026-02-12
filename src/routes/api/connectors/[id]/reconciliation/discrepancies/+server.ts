import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { listDiscrepancies } from '$lib/api/reconciliation';

export const GET: RequestHandler = async ({ params, url, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) {
		error(401, 'Unauthorized');
	}

	const run_id = url.searchParams.get('run_id') ?? undefined;
	const discrepancy_type = url.searchParams.get('discrepancy_type') ?? undefined;
	const resolution_status = url.searchParams.get('resolution_status') ?? undefined;
	const identity_id = url.searchParams.get('identity_id') ?? undefined;
	const external_uid = url.searchParams.get('external_uid') ?? undefined;
	const limit = Number(url.searchParams.get('limit') ?? '20');
	const offset = Number(url.searchParams.get('offset') ?? '0');

	const result = await listDiscrepancies(
		params.id,
		{ run_id, discrepancy_type, resolution_status, identity_id, external_uid, limit, offset },
		locals.accessToken,
		locals.tenantId,
		fetch
	);

	return json(result);
};
