import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { confirmTask } from '$lib/api/manual-tasks';

export const POST: RequestHandler = async ({ params, request, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) error(401, 'Unauthorized');

	const body = await request.json();
	const result = await confirmTask(params.id, body, locals.accessToken, locals.tenantId, fetch);
	return json(result);
};
