import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { setEntitlementOwner, removeEntitlementOwner } from '$lib/api/governance';

export const PUT: RequestHandler = async ({ params, request, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) {
		error(401, 'Unauthorized');
	}

	const body = await request.json();
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
