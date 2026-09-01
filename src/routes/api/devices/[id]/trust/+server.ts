import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { trustDevice, untrustDevice } from '$lib/api/devices';
import { JsonObjectError, parseBoundedInteger } from '$lib/utils/json-record';

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
	let trust_duration_days: number | undefined;
	if (body.trust_duration_days !== undefined) {
		try {
			trust_duration_days = parseBoundedInteger(
				body.trust_duration_days,
				1,
				3650,
				'trust_duration_days'
			);
		} catch (e) {
			if (e instanceof JsonObjectError) error(400, e.message);
			throw e;
		}
	}
	const result = await trustDevice(
		params.id,
		{
			trust_duration_days
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
