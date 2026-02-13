import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getSimulation, deleteSimulation } from '$lib/api/role-mining';

export const GET: RequestHandler = async ({ params, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) {
		error(401, 'Unauthorized');
	}

	const result = await getSimulation(
		params.simulationId,
		locals.accessToken,
		locals.tenantId,
		fetch
	);

	return json(result);
};

export const DELETE: RequestHandler = async ({ params, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) {
		error(401, 'Unauthorized');
	}

	await deleteSimulation(params.simulationId, locals.accessToken, locals.tenantId, fetch);

	return new Response(null, { status: 204 });
};
