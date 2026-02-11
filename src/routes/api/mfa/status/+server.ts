import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getMfaStatus } from '$lib/api/mfa';

export const GET: RequestHandler = async ({ locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) {
		error(401, 'Unauthorized');
	}

	const result = await getMfaStatus(locals.accessToken, locals.tenantId, fetch);

	return json(result);
};
