import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getManualTaskDashboard } from '$lib/api/manual-tasks';

export const GET: RequestHandler = async ({ locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) error(401, 'Unauthorized');

	const result = await getManualTaskDashboard(locals.accessToken, locals.tenantId, fetch);
	return json(result);
};
