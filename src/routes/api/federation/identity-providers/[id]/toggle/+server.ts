import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { toggleIdentityProvider } from '$lib/api/federation';

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
	if (typeof body.is_enabled !== 'boolean') {
		error(400, 'is_enabled is required');
	}
	const result = await toggleIdentityProvider(
		params.id,
		{ is_enabled: body.is_enabled },
		locals.accessToken,
		locals.tenantId,
		fetch
	);
	return json(result);
};
