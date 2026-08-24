import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { grantNhiPermission } from '$lib/api/nhi-permissions';
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
	if (typeof body.permission_type !== 'string' || body.permission_type.length === 0) {
		error(400, 'permission_type is required');
	}

	try {
		const result = await grantNhiPermission(
			params.id,
			params.targetId,
			{
				permission_type: body.permission_type,
				allowed_actions:
					body.allowed_actions && typeof body.allowed_actions === 'object'
						? (body.allowed_actions as Record<string, unknown>)
						: undefined,
				max_calls_per_hour:
					typeof body.max_calls_per_hour === 'number' ? body.max_calls_per_hour : undefined,
				expires_at: typeof body.expires_at === 'string' ? body.expires_at : undefined
			},
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
