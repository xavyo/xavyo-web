import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { renameDevice, removeDevice } from '$lib/api/devices';

export const PUT: RequestHandler = async ({ params, request, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) {
		error(401, 'Unauthorized');
	}

	const body = await request.json();
	const result = await renameDevice(params.id, body, locals.accessToken, locals.tenantId, fetch);

	return json(result);
};

export const DELETE: RequestHandler = async ({ params, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) {
		error(401, 'Unauthorized');
	}

	await removeDevice(params.id, locals.accessToken, locals.tenantId, fetch);

	return new Response(null, { status: 204 });
};
