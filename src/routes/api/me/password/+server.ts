import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { changePassword } from '$lib/api/me';

export const PUT: RequestHandler = async ({ request, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) {
		error(401, 'Unauthorized');
	}

	const body = await request.json();
	const result = await changePassword(body, locals.accessToken, locals.tenantId, fetch);

	return json(result);
};
