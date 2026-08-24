import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { rejectAccessRequest } from '$lib/api/access-requests';

export const POST: RequestHandler = async ({ params, request, locals, fetch }) => {
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
	if (typeof body.comments !== 'string' || body.comments.length === 0) {
		error(400, 'comments is required');
	}
	const result = await rejectAccessRequest(
		params.id,
		{ comments: body.comments },
		locals.accessToken,
		locals.tenantId,
		fetch
	);

	return json(result);
};
