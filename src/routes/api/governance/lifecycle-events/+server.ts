import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { listLifecycleEvents, createLifecycleEvent } from '$lib/api/birthright';
import type { CreateLifecycleEventRequest, LifecycleEventType } from '$lib/api/types';
import { listPagination } from '$lib/server/list-pagination';

const EVENT_TYPES = ['joiner', 'mover', 'leaver'] as const;

export const GET: RequestHandler = async ({ url, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) {
		error(401, 'Unauthorized');
	}

	const user_id = url.searchParams.get('user_id') ?? undefined;
	const event_type = url.searchParams.get('event_type') ?? undefined;
	const from = url.searchParams.get('from') ?? undefined;
	const to = url.searchParams.get('to') ?? undefined;
	const processedParam = url.searchParams.get('processed');
	const processed = processedParam != null ? processedParam === 'true' : undefined;

	const result = await listLifecycleEvents(
		{ user_id, event_type, from, to, processed, ...listPagination(url) },
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
	if (typeof body.user_id !== 'string' || body.user_id.length === 0) {
		error(400, 'user_id is required');
	}
	if (!EVENT_TYPES.includes(body.event_type as (typeof EVENT_TYPES)[number])) {
		error(400, 'event_type is required');
	}
	const data: CreateLifecycleEventRequest = {
		user_id: body.user_id,
		event_type: body.event_type as LifecycleEventType
	};
	if (body.attributes_before !== undefined) {
		if (
			!body.attributes_before ||
			typeof body.attributes_before !== 'object' ||
			Array.isArray(body.attributes_before)
		) {
			error(400, 'attributes_before must be an object');
		}
		data.attributes_before = body.attributes_before as Record<string, unknown>;
	}
	if (body.attributes_after !== undefined) {
		if (
			!body.attributes_after ||
			typeof body.attributes_after !== 'object' ||
			Array.isArray(body.attributes_after)
		) {
			error(400, 'attributes_after must be an object');
		}
		data.attributes_after = body.attributes_after as Record<string, unknown>;
	}
	if (body.source !== undefined) {
		if (typeof body.source !== 'string') {
			error(400, 'source must be a string');
		}
		data.source = body.source;
	}
	const result = await createLifecycleEvent(data, locals.accessToken, locals.tenantId, fetch);

	return json(result, { status: 201 });
};
