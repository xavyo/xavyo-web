import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { listSessions, revokeAllOtherSessions } from '$lib/api/sessions';

export const GET: RequestHandler = async ({ locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) {
		error(401, 'Unauthorized');
	}

	const result = await listSessions(locals.accessToken, locals.tenantId, fetch);

	return json(result);
};

export const DELETE: RequestHandler = async ({ locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) {
		error(401, 'Unauthorized');
	}

	const result = await revokeAllOtherSessions(locals.accessToken, locals.tenantId, fetch);

	return json(result);
};
