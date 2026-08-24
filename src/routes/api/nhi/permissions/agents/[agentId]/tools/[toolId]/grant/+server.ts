import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { grantToolPermission } from '$lib/api/nhi-permissions';
import type { GrantToolPermissionRequest } from '$lib/api/types';
import { ApiError } from '$lib/api/client';

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
	const data: GrantToolPermissionRequest = {};
	if (body.expires_at !== undefined) {
		if (typeof body.expires_at !== 'string') {
			error(400, 'expires_at must be a string');
		}
		data.expires_at = body.expires_at;
	}

	try {
		const result = await grantToolPermission(
			params.agentId,
			params.toolId,
			data,
			locals.accessToken,
			locals.tenantId,
			fetch
		);

		return json(result, { status: 201 });
	} catch (e) {
		if (e instanceof ApiError) error(e.status, e.message);
		throw e;
	}
};
