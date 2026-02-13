import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { listSimulations, createSimulation } from '$lib/api/role-mining';

export const GET: RequestHandler = async ({ url, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) {
		error(401, 'Unauthorized');
	}

	const status = url.searchParams.get('status') || undefined;
	const scenario_type = url.searchParams.get('scenario_type') || undefined;
	const limit = Number(url.searchParams.get('limit') ?? '50');
	const offset = Number(url.searchParams.get('offset') ?? '0');

	const result = await listSimulations(
		{ status, scenario_type, limit, offset },
		locals.accessToken,
		locals.tenantId,
		fetch
	);

	return json(result);
};

export const POST: RequestHandler = async ({ request, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) {
		error(401, 'Unauthorized');
	}

	const body = await request.json();
	const result = await createSimulation(body, locals.accessToken, locals.tenantId, fetch);

	return json(result, { status: 201 });
};
