import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getRoleDescendants } from '$lib/api/governance-roles';

export const GET: RequestHandler = async ({ params, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) {
		error(401, 'Unauthorized');
	}

	const result = await getRoleDescendants(params.id, locals.accessToken, locals.tenantId, fetch);

	return json(result);
};
