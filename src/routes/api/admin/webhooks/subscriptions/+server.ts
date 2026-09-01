import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { listWebhookSubscriptions, createWebhookSubscription } from '$lib/api/webhooks';
import { listPagination } from '$lib/server/list-pagination';

export const GET: RequestHandler = async ({ url, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) {
		error(401, 'Unauthorized');
	}

	const enabled =
		url.searchParams.get('enabled') === 'true'
			? true
			: url.searchParams.get('enabled') === 'false'
				? false
				: undefined;

	const result = await listWebhookSubscriptions(
		{ enabled, ...listPagination(url) },
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
	if (typeof body.name !== 'string' || body.name.length === 0) {
		error(400, 'name is required');
	}
	if (typeof body.url !== 'string' || body.url.length === 0) {
		error(400, 'url is required');
	}
	if (!Array.isArray(body.event_types) || body.event_types.length === 0) {
		error(400, 'event_types is required');
	}
	const result = await createWebhookSubscription(
		{
			name: body.name,
			url: body.url,
			event_types: body.event_types as string[],
			description: typeof body.description === 'string' ? body.description : undefined,
			secret: typeof body.secret === 'string' ? body.secret : undefined
		},
		locals.accessToken,
		locals.tenantId,
		fetch
	);

	return json(result, { status: 201 });
};
