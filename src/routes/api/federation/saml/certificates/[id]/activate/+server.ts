import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { activateCertificate } from '$lib/api/federation';

export const POST: RequestHandler = async ({ params, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) {
		error(401, 'Unauthorized');
	}

	await activateCertificate(params.id, locals.accessToken, locals.tenantId, fetch);

	return json({ success: true });
};
