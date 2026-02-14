import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getRiskAlertSummary } from '$lib/api/risk';
import { ApiError } from '$lib/api/client';

export const GET: RequestHandler = async ({ locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) error(401, 'Unauthorized');

	try {
		const result = await getRiskAlertSummary(locals.accessToken, locals.tenantId, fetch);
		return json(result);
	} catch (e) {
		if (e instanceof ApiError) error(e.status, e.message);
		error(500, 'Internal error');
	}
};
