import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { cancelInvitation } from '$lib/api/invitations';

export const DELETE: RequestHandler = async ({ params, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) {
		error(401, 'Unauthorized');
	}

	const result = await cancelInvitation(params.id, locals.accessToken, locals.tenantId, fetch);

	return json(result);
};
