import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getManualTask } from '$lib/api/manual-tasks';

export const GET: RequestHandler = async ({ params, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) error(401, 'Unauthorized');

	const result = await getManualTask(params.id, locals.accessToken, locals.tenantId, fetch);
	return json(result);
};
