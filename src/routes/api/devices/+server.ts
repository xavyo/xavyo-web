import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { listDevices } from '$lib/api/devices';

export const GET: RequestHandler = async ({ locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) {
		error(401, 'Unauthorized');
	}

	const result = await listDevices(locals.accessToken, locals.tenantId, fetch);

	return json(result);
};
