import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getRunReport } from '$lib/api/reconciliation';

export const GET: RequestHandler = async ({ params, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) {
		error(401, 'Unauthorized');
	}

	const result = await getRunReport(
		params.id,
		params.runId,
		locals.accessToken,
		locals.tenantId,
		fetch
	);

	return json(result);
};
