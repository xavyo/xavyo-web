import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { updateBatchSimulationNotes } from '$lib/api/simulations';
import { ApiError } from '$lib/api/client';

export const PATCH: RequestHandler = async ({ params, request, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) error(401, 'Unauthorized');

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
	if (typeof body.notes !== 'string') {
		error(400, 'notes is required');
	}

	try {
		const result = await updateBatchSimulationNotes(
			params.id,
			body.notes,
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
