import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { executeMerge } from '$lib/api/dedup';

export const POST: RequestHandler = async ({ request, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) {
		error(401, 'Unauthorized');
	}

	const body = await request.json();
	const result = await executeMerge(body, locals.accessToken, locals.tenantId, fetch);

	return json(result);
};
