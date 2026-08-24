import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import {
	getWebhookSubscription,
	updateWebhookSubscription,
	deleteWebhookSubscription
} from '$lib/api/webhooks';
import type { UpdateWebhookSubscriptionRequest } from '$lib/api/types';

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

	let parsed: unknown;
	try {
		parsed = await request.json();
	} catch {
		error(400, 'Invalid JSON body');
	}
	if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
		error(400, 'Invalid JSON body');
	}
	const body = parsed as Record<string, unknown>;
	const data: UpdateWebhookSubscriptionRequest = {};
	if (body.name !== undefined) {
		if (typeof body.name !== 'string' || body.name.length === 0) {
			error(400, 'name must be a non-empty string');
		}
		data.name = body.name;
	}
	if (body.description !== undefined) {
		if (typeof body.description !== 'string') {
			error(400, 'description must be a string');
		}
		data.description = body.description;
	}
	if (body.url !== undefined) {
		if (typeof body.url !== 'string' || body.url.length === 0) {
			error(400, 'url must be a non-empty string');
		}
		data.url = body.url;
	}
	if (body.secret !== undefined) {
		if (typeof body.secret !== 'string') {
			error(400, 'secret must be a string');
		}
		data.secret = body.secret;
	}
	if (body.event_types !== undefined) {
		if (
			!Array.isArray(body.event_types) ||
			body.event_types.length === 0 ||
			!body.event_types.every((item) => typeof item === 'string')
		) {
			error(400, 'event_types must be a non-empty array of strings');
		}
		data.event_types = body.event_types;
	}
	if (body.enabled !== undefined) {
		if (typeof body.enabled !== 'boolean') {
			error(400, 'enabled must be a boolean');
		}
		data.enabled = body.enabled;
	}
	const result = await updateWebhookSubscription(
		params.id,
		data,
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
