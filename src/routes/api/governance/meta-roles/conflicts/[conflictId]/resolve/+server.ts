import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { resolveConflict } from '$lib/api/meta-roles';

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
		body.resolution_status !== 'resolved_priority' &&
		body.resolution_status !== 'resolved_manual' &&
		body.resolution_status !== 'ignored'
	) {
		error(400, 'resolution_status is required');
	}
	const result = await resolveConflict(
		params.conflictId,
		{
			resolution_status: body.resolution_status,
			resolution_choice: body.resolution_choice,
			comment: typeof body.comment === 'string' ? body.comment : undefined
		},
		locals.accessToken,
		locals.tenantId,
		fetch
	);

	return json(result);
};
