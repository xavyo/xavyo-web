import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { trustDevice, untrustDevice } from '$lib/api/devices';

export const POST: RequestHandler = async ({ params, request, locals, fetch }) => {
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
	const result = await trustDevice(
		params.id,
		{
			trust_duration_days:
				typeof body.trust_duration_days === 'number' ? body.trust_duration_days : undefined
		},
		locals.accessToken,
		locals.tenantId,
		fetch
	);

	return json(result);
};

export const DELETE: RequestHandler = async ({ params, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) {
		error(401, 'Unauthorized');
	}

	const result = await untrustDevice(params.id, locals.accessToken, locals.tenantId, fetch);

	return json(result);
};
