import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { refreshAllPeerGroups } from '$lib/api/peer-groups';

export const POST: RequestHandler = async ({ locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) error(401, 'Unauthorized');
	const result = await refreshAllPeerGroups(locals.accessToken, locals.tenantId, fetch);
	return json(result);
};
