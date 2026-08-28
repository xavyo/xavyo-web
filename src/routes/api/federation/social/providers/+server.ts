import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { listSocialProviders } from '$lib/api/social';

export const GET: RequestHandler = async ({ locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) {
		error(401, 'Unauthorized');
	}

	const result = await listSocialProviders(locals.accessToken, locals.tenantId, fetch);
	return json(result);
};
