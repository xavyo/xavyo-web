import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { dismissDuplicate } from '$lib/api/dedup';

export const POST: RequestHandler = async ({ params, request, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) {
		error(401, 'Unauthorized');
	}

	const body = await request.json();
	const result = await dismissDuplicate(
		params.id,
		body.reason,
		locals.accessToken,
		locals.tenantId,
		fetch
	);

	return json(result);
};
