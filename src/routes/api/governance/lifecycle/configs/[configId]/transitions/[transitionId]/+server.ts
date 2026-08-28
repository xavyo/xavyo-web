import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { deleteTransition } from '$lib/api/lifecycle';

export const DELETE: RequestHandler = async ({ params, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) error(401, 'Unauthorized');
	await deleteTransition(params.configId, params.transitionId, locals.accessToken, locals.tenantId, fetch);
	return new Response(null, { status: 204 });
};
