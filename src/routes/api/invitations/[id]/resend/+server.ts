import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { resendInvitation } from '$lib/api/invitations';

export const POST: RequestHandler = async ({ params, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) {
		error(401, 'Unauthorized');
	}

	await resendInvitation(params.id, locals.accessToken, locals.tenantId, fetch);

	return new Response(null, { status: 204 });
};
