import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { callMcpTool } from '$lib/api/mcp';
import type { McpCallRequest, McpContext } from '$lib/api/types';

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
	if (typeof body.nhi_id !== 'string' || body.nhi_id.length === 0) {
		error(400, 'nhi_id is required');
	}
	if (!body.parameters || typeof body.parameters !== 'object' || Array.isArray(body.parameters)) {
		error(400, 'parameters is required');
	}
	const data: McpCallRequest & { nhi_id: string } = {
		nhi_id: body.nhi_id,
		parameters: body.parameters as Record<string, unknown>
	};
	if (body.context !== undefined) {
		if (!body.context || typeof body.context !== 'object' || Array.isArray(body.context)) {
			error(400, 'context must be an object');
		}
		data.context = body.context as McpContext;
	}
	const result = await callMcpTool(
		params.name,
		data,
		locals.accessToken,
		locals.tenantId,
		fetch
	);

	return json(result);
};
