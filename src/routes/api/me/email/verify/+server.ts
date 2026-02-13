import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { verifyEmailChange } from '$lib/api/me';

export const POST: RequestHandler = async ({ request, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) {
		error(401, 'Unauthorized');
	}

	const body = await request.json();
	const result = await verifyEmailChange(body, locals.accessToken, locals.tenantId, fetch);

	return json(result);
};
