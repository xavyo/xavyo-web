import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { rotateSecret } from '$lib/api/nhi-vault';
import { ApiError } from '$lib/api/client';
import type { RotateSecretRequest } from '$lib/api/types';

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
	if (typeof body.value !== 'string' || body.value.length === 0) {
		error(400, 'value is required');
	}
	const data: RotateSecretRequest = { value: body.value };

	try {
		const result = await rotateSecret(
			params.nhiId,
			params.secretId,
			data,
			locals.accessToken,
			locals.tenantId,
			fetch
		);
		return json(result);
	} catch (e) {
		if (e instanceof ApiError) error(e.status, e.message);
		throw e;
	}
};
