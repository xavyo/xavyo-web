import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { cascadeMetaRole } from '$lib/api/meta-roles';

export const POST: RequestHandler = async ({ params, request, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) {
		error(401, 'Unauthorized');
	}

	const body = await request.json();
	const result = await cascadeMetaRole(
		params.id,
		body,
		locals.accessToken,
		locals.tenantId,
		fetch
	);

	return json(result, { status: 202 });
};
