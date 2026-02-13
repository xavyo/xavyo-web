import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getSecurityOverview } from '$lib/api/me';

export const GET: RequestHandler = async ({ locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) {
		error(401, 'Unauthorized');
	}

	const result = await getSecurityOverview(locals.accessToken, locals.tenantId, fetch);

	return json(result);
};
