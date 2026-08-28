import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { disableRoleInducement } from '$lib/api/governance-roles';

export const POST: RequestHandler = async ({ params, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) error(401, 'Unauthorized');

	const result = await disableRoleInducement(params.id, params.iid, locals.accessToken, locals.tenantId, fetch);
	return json(result);
};
