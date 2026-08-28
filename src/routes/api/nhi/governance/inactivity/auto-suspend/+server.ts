import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { autoSuspendExpired } from '$lib/api/nhi-governance';
import { ApiError } from '$lib/api/client';

export const POST: RequestHandler = async ({ locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) {
		error(401, 'Unauthorized');
	}

	try {
		const result = await autoSuspendExpired(locals.accessToken, locals.tenantId, fetch);
		return json(result);
	} catch (e) {
		if (e instanceof ApiError) error(e.status, e.message);
		throw e;
	}
};
