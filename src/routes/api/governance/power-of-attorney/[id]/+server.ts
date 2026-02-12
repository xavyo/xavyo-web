import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getPoa } from '$lib/api/power-of-attorney';

export const GET: RequestHandler = async ({ params, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) {
		error(401, 'Unauthorized');
	}

	const result = await getPoa(params.id, locals.accessToken, locals.tenantId, fetch);
	return json(result);
};
