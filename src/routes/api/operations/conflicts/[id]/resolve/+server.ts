import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { resolveConflict } from '$lib/api/operations';

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
	if (
		body.outcome !== 'applied' &&
		body.outcome !== 'superseded' &&
		body.outcome !== 'merged' &&
		body.outcome !== 'rejected'
	) {
		error(400, 'outcome is required');
	}
	const result = await resolveConflict(
		params.id,
		{
			outcome: body.outcome,
			notes: typeof body.notes === 'string' ? body.notes : undefined
		},
		locals.accessToken,
		locals.tenantId,
		fetch
	);
	return json(result);
};
