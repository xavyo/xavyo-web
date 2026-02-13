import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { seedDefaultRules } from '$lib/api/detection-rules';

export const POST: RequestHandler = async ({ locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) error(401, 'Unauthorized');

	const result = await seedDefaultRules(locals.accessToken, locals.tenantId, fetch);
	return json(result);
};
