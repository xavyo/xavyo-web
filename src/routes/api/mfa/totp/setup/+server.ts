import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { setupTotp } from '$lib/api/mfa';

export const POST: RequestHandler = async ({ locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) {
		error(401, 'Unauthorized');
	}

	const result = await setupTotp(locals.accessToken, locals.tenantId, fetch);

	return json(result);
};
