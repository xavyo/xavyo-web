import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getScriptAnalyticsDashboard } from '$lib/api/script-analytics';

export const GET: RequestHandler = async ({ locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) error(401, 'Unauthorized');

	const result = await getScriptAnalyticsDashboard(locals.accessToken, locals.tenantId, fetch);
	return json(result);
};
