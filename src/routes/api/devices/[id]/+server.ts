import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { renameDevice, removeDevice } from '$lib/api/devices';
import type { RenameDeviceRequest } from '$lib/api/types';

export const PUT: RequestHandler = async ({ params, request, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) {
		error(401, 'Unauthorized');
	}

	let parsed: unknown;
	try {
		parsed = await request.json();
	} catch {
		error(400, 'Invalid JSON body');
	}
	if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
		error(400, 'Invalid JSON body');
	}
	const body = parsed as Record<string, unknown>;
	if (typeof body.device_name !== 'string' || body.device_name.length === 0) {
		error(400, 'device_name is required');
	}
	const data: RenameDeviceRequest = { device_name: body.device_name };
	const result = await renameDevice(params.id, data, locals.accessToken, locals.tenantId, fetch);

	return json(result);
};

export const DELETE: RequestHandler = async ({ params, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) {
		error(401, 'Unauthorized');
	}

	await removeDevice(params.id, locals.accessToken, locals.tenantId, fetch);

	return new Response(null, { status: 204 });
};
