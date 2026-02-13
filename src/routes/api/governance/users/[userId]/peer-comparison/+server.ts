import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getUserPeerComparison } from '$lib/api/peer-groups';

export const GET: RequestHandler = async ({ params, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) error(401, 'Unauthorized');
	const result = await getUserPeerComparison(params.userId, locals.accessToken, locals.tenantId, fetch);
	return json(result);
};
