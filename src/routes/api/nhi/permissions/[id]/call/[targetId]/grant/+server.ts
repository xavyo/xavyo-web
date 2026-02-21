import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { grantNhiPermission } from '$lib/api/nhi-permissions';
import { ApiError } from '$lib/api/client';

export const POST: RequestHandler = async ({ params, request, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) {
		error(401, 'Unauthorized');
	}

	const body = await request.json();

	try {
		const result = await grantNhiPermission(
			params.id,
			params.targetId,
			body,
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
