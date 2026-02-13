import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { trustDevice, untrustDevice } from '$lib/api/devices';

export const POST: RequestHandler = async ({ params, request, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) {
		error(401, 'Unauthorized');
	}

	const body = await request.json();
	const result = await trustDevice(params.id, body, locals.accessToken, locals.tenantId, fetch);

	return json(result);
};

export const DELETE: RequestHandler = async ({ params, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) {
		error(401, 'Unauthorized');
	}

	const result = await untrustDevice(params.id, locals.accessToken, locals.tenantId, fetch);

	return json(result);
};
