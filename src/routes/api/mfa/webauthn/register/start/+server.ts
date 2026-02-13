import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { startWebauthnRegistration } from '$lib/api/mfa';

export const POST: RequestHandler = async ({ request, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) {
		error(401, 'Unauthorized');
	}

	const body = await request.json();
	const result = await startWebauthnRegistration(body, locals.accessToken, locals.tenantId, fetch);

	return json(result);
};
