import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { listReconciliationActions } from '$lib/api/reconciliation';
import { listPagination } from '$lib/server/list-pagination';

export const GET: RequestHandler = async ({ params, url, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) {
		error(401, 'Unauthorized');
	}

	const discrepancy_id = url.searchParams.get('discrepancy_id') ?? undefined;
	const action_type = url.searchParams.get('action_type') ?? undefined;
	const result_filter = url.searchParams.get('result') ?? undefined;
	const dry_run_param = url.searchParams.get('dry_run');
	const dry_run = dry_run_param !== null ? dry_run_param === 'true' : undefined;

	const resultData = await listReconciliationActions(
		params.id,
		{ discrepancy_id, action_type, result: result_filter, dry_run, ...listPagination(url) },
		locals.accessToken,
		locals.tenantId,
		fetch
	);

	return json(resultData);
};
