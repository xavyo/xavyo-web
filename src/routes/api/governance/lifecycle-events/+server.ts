import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { listLifecycleEvents, createLifecycleEvent } from '$lib/api/birthright';

export const GET: RequestHandler = async ({ url, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) {
		error(401, 'Unauthorized');
	}

	const offset = Number(url.searchParams.get('offset') ?? '0');
	const limit = Number(url.searchParams.get('limit') ?? '20');
	const user_id = url.searchParams.get('user_id') ?? undefined;
	const event_type = url.searchParams.get('event_type') ?? undefined;
	const from = url.searchParams.get('from') ?? undefined;
	const to = url.searchParams.get('to') ?? undefined;
	const processedParam = url.searchParams.get('processed');
	const processed = processedParam != null ? processedParam === 'true' : undefined;

	const result = await listLifecycleEvents(
		{ user_id, event_type, from, to, processed, limit, offset },
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
	const result = await createLifecycleEvent(body, locals.accessToken, locals.tenantId, fetch);

	return json(result, { status: 201 });
};
