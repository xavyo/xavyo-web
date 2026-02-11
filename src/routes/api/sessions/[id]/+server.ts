import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { revokeSession } from '$lib/api/sessions';

export const DELETE: RequestHandler = async ({ params, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) {
		error(401, 'Unauthorized');
	}

	await revokeSession(params.id, locals.accessToken, locals.tenantId, fetch);

	return new Response(null, { status: 204 });
};
