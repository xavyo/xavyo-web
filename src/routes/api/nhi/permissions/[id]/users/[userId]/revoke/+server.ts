import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { revokeUserPermission } from '$lib/api/nhi-permissions';

export const POST: RequestHandler = async ({ params, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) {
		error(401, 'Unauthorized');
	}

	const result = await revokeUserPermission(
		params.id,
		params.userId,
		locals.accessToken,
		locals.tenantId,
		fetch
	);

	return json(result);
};
