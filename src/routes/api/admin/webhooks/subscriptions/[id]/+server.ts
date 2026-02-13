import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import {
	getWebhookSubscription,
	updateWebhookSubscription,
	deleteWebhookSubscription
} from '$lib/api/webhooks';

export const GET: RequestHandler = async ({ params, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) {
		error(401, 'Unauthorized');
	}

	const result = await getWebhookSubscription(params.id, locals.accessToken, locals.tenantId, fetch);

	return json(result);
};

export const PATCH: RequestHandler = async ({ params, request, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) {
		error(401, 'Unauthorized');
	}

	const body = await request.json();
	const result = await updateWebhookSubscription(
		params.id,
		body,
		locals.accessToken,
		locals.tenantId,
		fetch
	);

	return json(result);
};

export const DELETE: RequestHandler = async ({ params, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) {
		error(401, 'Unauthorized');
	}

	await deleteWebhookSubscription(params.id, locals.accessToken, locals.tenantId, fetch);

	return new Response(null, { status: 204 });
};
