import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { executeSimulation } from '$lib/api/role-mining';

export const POST: RequestHandler = async ({ params, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) {
		error(401, 'Unauthorized');
	}

	const result = await executeSimulation(
		params.simulationId,
		locals.accessToken,
		locals.tenantId,
		fetch
	);

	return json(result);
};
