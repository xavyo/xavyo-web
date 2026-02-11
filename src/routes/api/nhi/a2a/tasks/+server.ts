import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { listA2aTasks, createA2aTask } from '$lib/api/a2a';

export const GET: RequestHandler = async ({ url, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) {
		error(401, 'Unauthorized');
	}

	const state = url.searchParams.get('state') ?? undefined;
	const target_agent_id = url.searchParams.get('target_agent_id') ?? undefined;
	const limit = Number(url.searchParams.get('limit') ?? '20');
	const offset = Number(url.searchParams.get('offset') ?? '0');

	const result = await listA2aTasks(
		{ state, target_agent_id, limit, offset },
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
	const result = await createA2aTask(body, locals.accessToken, locals.tenantId, fetch);

	return json(result, { status: 201 });
};
