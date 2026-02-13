import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getRoleMetrics } from '$lib/api/role-mining';

export const GET: RequestHandler = async ({ params, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) {
		error(401, 'Unauthorized');
	}

	const result = await getRoleMetrics(
		params.roleId,
		locals.accessToken,
		locals.tenantId,
		fetch
	);

	return json(result);
};
