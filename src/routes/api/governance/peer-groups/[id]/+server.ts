import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getPeerGroup, deletePeerGroup } from '$lib/api/peer-groups';

export const GET: RequestHandler = async ({ params, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) error(401, 'Unauthorized');
	const result = await getPeerGroup(params.id, locals.accessToken, locals.tenantId, fetch);
	return json(result);
};

export const DELETE: RequestHandler = async ({ params, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) error(401, 'Unauthorized');
	await deletePeerGroup(params.id, locals.accessToken, locals.tenantId, fetch);
	return new Response(null, { status: 204 });
};
