import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { reassignCorrelationCase } from '$lib/api/correlation';

export const POST: RequestHandler = async ({ params, request, locals, fetch }) => {
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
	if (typeof body.assigned_to !== 'string' || body.assigned_to.length === 0) {
		error(400, 'assigned_to is required');
	}
	const result = await reassignCorrelationCase(
		params.caseId,
		{
			assigned_to: body.assigned_to,
			reason: typeof body.reason === 'string' ? body.reason : undefined
		},
		locals.accessToken,
		locals.tenantId,
		fetch
	);
	return json(result);
};
