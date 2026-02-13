import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { promoteCandidate } from '$lib/api/role-mining';

export const POST: RequestHandler = async ({ params, request, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) {
		error(401, 'Unauthorized');
	}

	const body = await request.json();
	const result = await promoteCandidate(
		params.candidateId,
		body,
		locals.accessToken,
		locals.tenantId,
		fetch
	);

	return json(result);
};
