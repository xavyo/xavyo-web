import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { checkNhiSod } from '$lib/api/nhi-governance';
import { ApiError } from '$lib/api/client';
import type { NhiSodCheckRequest } from '$lib/api/types';

export const POST: RequestHandler = async ({ request, locals, fetch }) => {
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
	if (typeof body.agent_id !== 'string' || body.agent_id.length === 0) {
		error(400, 'agent_id is required');
	}
	if (typeof body.tool_id !== 'string' || body.tool_id.length === 0) {
		error(400, 'tool_id is required');
	}
	const data: NhiSodCheckRequest = { agent_id: body.agent_id, tool_id: body.tool_id };

	try {
		const result = await checkNhiSod(data, locals.accessToken, locals.tenantId, fetch);
		return json(result);
	} catch (e) {
		if (e instanceof ApiError) error(e.status, e.message);
		throw e;
	}
};
