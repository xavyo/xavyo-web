import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { moveRole } from '$lib/api/governance-roles';

export const POST: RequestHandler = async ({ params, request, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) {
		error(401, 'Unauthorized');
	}

	const body = await request.json();
	const result = await moveRole(
		params.id,
		body,
		locals.accessToken,
		locals.tenantId,
		fetch
	);

	return json(result);
};
