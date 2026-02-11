import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { grantUserPermission } from '$lib/api/nhi-permissions';

export const POST: RequestHandler = async ({ params, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) {
		error(401, 'Unauthorized');
	}

	const result = await grantUserPermission(
		params.id,
		params.userId,
		locals.accessToken,
		locals.tenantId,
		fetch
	);

	return json(result, { status: 201 });
};
