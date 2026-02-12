import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { listWebhookEventTypes } from '$lib/api/webhooks';

export const GET: RequestHandler = async ({ locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) {
		error(401, 'Unauthorized');
	}

	const result = await listWebhookEventTypes(locals.accessToken, locals.tenantId, fetch);

	return json(result);
};
