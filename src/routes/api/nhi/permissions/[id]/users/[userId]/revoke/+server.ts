import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { revokeUserPermission } from '$lib/api/nhi-permissions';
import { ApiError } from '$lib/api/client';

export const POST: RequestHandler = async ({ params, request, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) {
		error(401, 'Unauthorized');
	}

	const body = await request.json().catch(() => ({})) as Record<string, unknown>;

	try {
		const result = await revokeUserPermission(
			params.id,
			params.userId,
			{
				permission_type: (body.permission_type as string) || 'use'
			},
			locals.accessToken,
			locals.tenantId,
			fetch
		);

		return json(result);
	} catch (e) {
		if (e instanceof ApiError) error(e.status, e.message);
		throw e;
	}
};
