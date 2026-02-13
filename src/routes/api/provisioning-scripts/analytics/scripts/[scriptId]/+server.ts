import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getScriptAnalytics } from '$lib/api/script-analytics';

export const GET: RequestHandler = async ({ params, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) error(401, 'Unauthorized');

	const result = await getScriptAnalytics(
		params.scriptId,
		locals.accessToken,
		locals.tenantId,
		fetch
	);
	return json(result);
};
