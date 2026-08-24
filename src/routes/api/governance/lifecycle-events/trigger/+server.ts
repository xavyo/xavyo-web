import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { triggerLifecycleEvent } from '$lib/api/birthright';

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
	if (body.event_type !== 'joiner' && body.event_type !== 'mover' && body.event_type !== 'leaver') {
		error(400, 'event_type is required');
	}
	const result = await triggerLifecycleEvent(
		{
			user_id: body.user_id,
			event_type: body.event_type,
			attributes_before:
				body.attributes_before && typeof body.attributes_before === 'object'
					? (body.attributes_before as Record<string, unknown>)
					: undefined,
			attributes_after:
				body.attributes_after && typeof body.attributes_after === 'object'
					? (body.attributes_after as Record<string, unknown>)
					: undefined,
			source: typeof body.source === 'string' ? body.source : undefined
		},
		locals.accessToken,
		locals.tenantId,
		fetch
	);

	return json(result);
};
