import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { grantGracePeriod } from '$lib/api/nhi-governance';
import { ApiError } from '$lib/api/client';

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
	if (typeof body.grace_days !== 'number') {
		error(400, 'grace_days is required');
	}
	try {
		await grantGracePeriod(params.id, body.grace_days, locals.accessToken, locals.tenantId, fetch);
		return new Response(null, { status: 204 });
	} catch (e) {
		if (e instanceof ApiError) error(e.status, e.message);
		throw e;
	}
};
