import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getCandidate } from '$lib/api/role-mining';

export const GET: RequestHandler = async ({ params, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) {
		error(401, 'Unauthorized');
	}

	const result = await getCandidate(
		params.candidateId,
		locals.accessToken,
		locals.tenantId,
		fetch
	);

	return json(result);
};
