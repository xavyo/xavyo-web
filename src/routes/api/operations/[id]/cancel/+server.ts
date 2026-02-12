import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { cancelOperation } from '$lib/api/operations';

export const POST: RequestHandler = async ({ params, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) {
		error(401, 'Unauthorized');
	}

	const result = await cancelOperation(params.id, locals.accessToken, locals.tenantId, fetch);
	return json(result);
};
