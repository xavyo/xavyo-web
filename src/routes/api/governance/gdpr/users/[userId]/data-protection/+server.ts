import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getUserDataProtection } from '$lib/api/gdpr';

export const GET: RequestHandler = async ({ params, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) error(401, 'Unauthorized');

	const result = await getUserDataProtection(params.userId, locals.accessToken, locals.tenantId, fetch);
	return json(result);
};
