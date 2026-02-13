import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { deleteMapping } from '$lib/api/authorization';

export const DELETE: RequestHandler = async ({ params, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) {
		error(401, 'Unauthorized');
	}

	await deleteMapping(params.id, locals.accessToken, locals.tenantId, fetch);

	return new Response(null, { status: 204 });
};
