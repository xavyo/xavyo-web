import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getRoleTree } from '$lib/api/governance-roles';

export const GET: RequestHandler = async ({ locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) {
		error(401, 'Unauthorized');
	}

	const result = await getRoleTree(locals.accessToken, locals.tenantId, fetch);

	return json(result);
};
