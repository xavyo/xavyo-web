import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getUserLifecycleStatus } from '$lib/api/lifecycle';

export const GET: RequestHandler = async ({ params, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) error(401, 'Unauthorized');
	const result = await getUserLifecycleStatus(params.userId, locals.accessToken, locals.tenantId, fetch);
	return json(result);
};
