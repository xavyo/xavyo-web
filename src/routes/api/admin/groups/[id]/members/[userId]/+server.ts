import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { removeGroupMember } from '$lib/api/groups';

export const DELETE: RequestHandler = async ({ params, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) {
		error(401, 'Unauthorized');
	}

	await removeGroupMember(params.id, params.userId, locals.accessToken, locals.tenantId, fetch);

	return new Response(null, { status: 204 });
};
