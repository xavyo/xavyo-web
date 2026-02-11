import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getA2aTask } from '$lib/api/a2a';

export const GET: RequestHandler = async ({ params, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) {
		error(401, 'Unauthorized');
	}

	const result = await getA2aTask(params.id, locals.accessToken, locals.tenantId, fetch);

	return json(result);
};
