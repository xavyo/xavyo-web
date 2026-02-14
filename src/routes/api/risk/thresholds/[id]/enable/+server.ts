import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { enableRiskThreshold } from '$lib/api/risk';
import { ApiError } from '$lib/api/client';

export const POST: RequestHandler = async ({ params, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) error(401, 'Unauthorized');

	try {
		const result = await enableRiskThreshold(params.id, locals.accessToken, locals.tenantId, fetch);
		return json(result);
	} catch (e) {
		if (e instanceof ApiError) error(e.status, e.message);
		error(500, 'Internal error');
	}
};
