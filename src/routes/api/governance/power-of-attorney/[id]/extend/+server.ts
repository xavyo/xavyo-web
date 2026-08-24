import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { extendPoa } from '$lib/api/power-of-attorney';
import type { ExtendPoaRequest } from '$lib/api/types';

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
	if (typeof body.new_ends_at !== 'string' || body.new_ends_at.length === 0) {
		error(400, 'new_ends_at is required');
	}
	const data: ExtendPoaRequest = { new_ends_at: body.new_ends_at };
	const result = await extendPoa(params.id, data, locals.accessToken, locals.tenantId, fetch);
	return json(result);
};
