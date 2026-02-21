import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { grantUserPermission } from '$lib/api/nhi-permissions';
import { ApiError } from '$lib/api/client';

export const POST: RequestHandler = async ({ params, request, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) {
		error(401, 'Unauthorized');
	}

	const body = await request.json().catch(() => ({})) as Record<string, unknown>;

	try {
		const result = await grantUserPermission(
			params.id,
			params.userId,
			{
				permission_type: (body.permission_type as string) || 'use',
				expires_at: body.expires_at as string | undefined
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
