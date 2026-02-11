import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { apiClient } from '$lib/api/client';

export const POST: RequestHandler = async ({ request, params, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) {
		error(401, 'Unauthorized');
	}

	const body = await request.json();
	const result = await apiClient(`/auth/social/link/${params.provider}`, {
		method: 'POST',
		body,
		token: locals.accessToken,
		tenantId: locals.tenantId,
		fetch
	});
	return json(result);
};
