import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { assignRole, revokeRole, checkUserHasRole } from '$lib/api/governance-roles';

export const POST: RequestHandler = async ({ params, request, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) {
		error(401, 'Unauthorized');
	}

	const body = await request.json();
	const result = await assignRole(
		params.id,
		params.userId,
		body,
		locals.accessToken,
		locals.tenantId,
		fetch
	);

	return json(result, { status: 201 });
};

export const DELETE: RequestHandler = async ({ params, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) {
		error(401, 'Unauthorized');
	}

	const result = await revokeRole(
		params.id,
		params.userId,
		locals.accessToken,
		locals.tenantId,
		fetch
	);

	return json(result);
};

export const GET: RequestHandler = async ({ params, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) {
		error(401, 'Unauthorized');
	}

	const result = await checkUserHasRole(
		params.id,
		params.userId,
		locals.accessToken,
		locals.tenantId,
		fetch
	);

	return json(result);
};
