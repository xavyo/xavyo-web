import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { hasAdminRole } from '$lib/server/auth';
import { confirmCorrelationCase } from '$lib/api/correlation';

export const POST: RequestHandler = async ({ params, request, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) error(401, 'Unauthorized');
	if (!hasAdminRole(locals.user?.roles)) error(403, 'Forbidden');
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
	if (typeof body.candidate_id !== 'string' || body.candidate_id.length === 0) {
		error(400, 'candidate_id is required');
	}
	const result = await confirmCorrelationCase(
		params.caseId,
		{
			candidate_id: body.candidate_id,
			reason: typeof body.reason === 'string' ? body.reason : undefined
		},
		locals.accessToken,
		locals.tenantId,
		fetch
	);
	return json(result);
};
