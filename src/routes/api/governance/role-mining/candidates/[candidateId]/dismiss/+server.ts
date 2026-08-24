import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { dismissCandidate } from '$lib/api/role-mining';
import type { DismissCandidateRequest } from '$lib/api/types';

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
	const data: DismissCandidateRequest = {};
	if (body.reason !== undefined) {
		if (typeof body.reason !== 'string') {
			error(400, 'reason must be a string');
		}
		data.reason = body.reason;
	}
	const result = await dismissCandidate(
		params.candidateId,
		data,
		locals.accessToken,
		locals.tenantId,
		fetch
	);

	return json(result);
};
