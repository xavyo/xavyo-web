import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { promoteCandidate } from '$lib/api/role-mining';
import type { PromoteCandidateRequest } from '$lib/api/types';

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
	const data: PromoteCandidateRequest = {};
	if (body.role_name !== undefined) {
		if (typeof body.role_name !== 'string') {
			error(400, 'role_name must be a string');
		}
		data.role_name = body.role_name;
	}
	if (body.description !== undefined) {
		if (typeof body.description !== 'string') {
			error(400, 'description must be a string');
		}
		data.description = body.description;
	}
	const result = await promoteCandidate(
		params.candidateId,
		data,
		locals.accessToken,
		locals.tenantId,
		fetch
	);

	return json(result);
};
