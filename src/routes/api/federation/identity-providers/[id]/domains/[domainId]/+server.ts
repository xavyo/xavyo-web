import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { removeDomain } from '$lib/api/federation';

export const DELETE: RequestHandler = async ({ params, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) {
		error(401, 'Unauthorized');
	}

	await removeDomain(params.id, params.domainId, locals.accessToken, locals.tenantId, fetch);
	return new Response(null, { status: 204 });
};
