import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { unlinkSocialAccount } from '$lib/api/social';

export const DELETE: RequestHandler = async ({ params, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) {
		error(401, 'Unauthorized');
	}
	// No admin check - user-level endpoint
	await unlinkSocialAccount(params.provider, locals.accessToken, locals.tenantId, fetch);
	return new Response(null, { status: 204 });
};
