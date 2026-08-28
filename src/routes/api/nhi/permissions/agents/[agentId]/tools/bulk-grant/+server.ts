import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { bulkGrantToolPermissions } from '$lib/api/nhi-permissions';
import { ApiError } from '$lib/api/client';

export const POST: RequestHandler = async ({ params, request, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) {
		error(401, 'Unauthorized');
	}


	try {
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
		if (!Array.isArray(body.tool_ids) || body.tool_ids.length === 0) {
			error(400, 'tool_ids is required');
		}
		const result = await bulkGrantToolPermissions(
			params.agentId,
			{
				tool_ids: body.tool_ids as string[],
				permission_type:
					typeof body.permission_type === 'string' ? body.permission_type : undefined,
				expires_at: typeof body.expires_at === 'string' ? body.expires_at : undefined
			},
			locals.accessToken,
			locals.tenantId,
			fetch
		);
		return json(result);
	} catch (e) {
		if (e instanceof ApiError) {
			error(e.status, e.message);
		}
		throw e;
	}
};
