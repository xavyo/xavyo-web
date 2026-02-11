import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { listAgentTools } from '$lib/api/nhi-permissions';

export const GET: RequestHandler = async ({ params, url, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) {
		error(401, 'Unauthorized');
	}

	const limit = Number(url.searchParams.get('limit') ?? '20');
	const offset = Number(url.searchParams.get('offset') ?? '0');

	const result = await listAgentTools(
		params.agentId,
		{ limit, offset },
		locals.accessToken,
		locals.tenantId,
		fetch
	);

	return json(result);
};
