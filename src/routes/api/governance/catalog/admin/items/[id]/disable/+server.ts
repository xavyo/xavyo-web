import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { adminDisableItem } from '$lib/api/catalog';

export const POST: RequestHandler = async ({ params, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) error(401, 'Unauthorized');
	const result = await adminDisableItem(params.id, locals.accessToken, locals.tenantId, fetch);
	return json(result);
};
