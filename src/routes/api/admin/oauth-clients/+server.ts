import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { listOAuthClients, createOAuthClient } from '$lib/api/oauth-clients';

export const GET: RequestHandler = async ({ locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) {
		error(401, 'Unauthorized');
	}

	const result = await listOAuthClients(locals.accessToken, locals.tenantId, fetch);

	return json(result);
};

export const POST: RequestHandler = async ({ request, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) {
		error(401, 'Unauthorized');
	}

	const body = await request.json();
	const result = await createOAuthClient(body, locals.accessToken, locals.tenantId, fetch);

	return json(result, { status: 201 });
};
