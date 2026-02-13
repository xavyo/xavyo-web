import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getRiskAlertsSummary } from '$lib/api/risk';

export const GET: RequestHandler = async ({ locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) {
		error(401, 'Unauthorized');
	}

	const result = await getRiskAlertsSummary(locals.accessToken, locals.tenantId, fetch);

	return json(result);
};
