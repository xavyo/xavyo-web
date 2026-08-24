import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { setEntitlementOwner, removeEntitlementOwner } from '$lib/api/governance';

export const PUT: RequestHandler = async ({ params, request, locals, fetch }) => {
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
	if (typeof body.owner_id !== 'string' || body.owner_id.length === 0) {
		error(400, 'owner_id is required');
	}
	const result = await setEntitlementOwner(
		params.id,
		body.owner_id,
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

	const result = await removeEntitlementOwner(
		params.id,
		locals.accessToken,
		locals.tenantId,
		fetch
	);

	return json(result);
};
