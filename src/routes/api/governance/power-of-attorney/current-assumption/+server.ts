import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getCurrentAssumption } from '$lib/api/power-of-attorney';

export const GET: RequestHandler = async ({ locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) {
		error(401, 'Unauthorized');
	}

	const result = await getCurrentAssumption(locals.accessToken, locals.tenantId, fetch);
	return json(result);
};
