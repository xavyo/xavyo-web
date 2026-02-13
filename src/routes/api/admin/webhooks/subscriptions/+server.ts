import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { listWebhookSubscriptions, createWebhookSubscription } from '$lib/api/webhooks';

export const GET: RequestHandler = async ({ url, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) {
		error(401, 'Unauthorized');
	}

	const limit = Number(url.searchParams.get('limit') ?? '20');
	const offset = Number(url.searchParams.get('offset') ?? '0');

	const result = await listWebhookSubscriptions(
		{ limit, offset },
		locals.accessToken,
		locals.tenantId,
		fetch
	);

	return json(result);
};

export const POST: RequestHandler = async ({ request, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) {
		error(401, 'Unauthorized');
	}

	const body = await request.json();
	const result = await createWebhookSubscription(body, locals.accessToken, locals.tenantId, fetch);

	return json(result, { status: 201 });
};
