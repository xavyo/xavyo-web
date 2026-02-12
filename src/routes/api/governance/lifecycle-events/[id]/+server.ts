import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getLifecycleEvent } from '$lib/api/birthright';

export const GET: RequestHandler = async ({ params, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) {
		error(401, 'Unauthorized');
	}

	const result = await getLifecycleEvent(params.id, locals.accessToken, locals.tenantId, fetch);

	return json(result);
};
