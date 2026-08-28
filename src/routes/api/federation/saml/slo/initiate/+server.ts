import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { initiateSamlSlo } from '$lib/api/federation';

export const POST: RequestHandler = async ({ locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) error(401, 'Unauthorized');

	const result = await initiateSamlSlo(locals.accessToken, locals.tenantId, fetch);
	return json(result);
};
