import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getExcessivePrivilege } from '$lib/api/role-mining';

export const GET: RequestHandler = async ({ params, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) {
		error(401, 'Unauthorized');
	}

	const result = await getExcessivePrivilege(
		params.flagId,
		locals.accessToken,
		locals.tenantId,
		fetch
	);

	return json(result);
};
