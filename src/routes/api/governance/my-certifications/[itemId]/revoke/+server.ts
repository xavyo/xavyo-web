import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { revokeItem } from '$lib/api/my-certifications';

export const POST: RequestHandler = async ({ params, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) {
		error(401, 'Unauthorized');
	}

	const result = await revokeItem(
		params.itemId,
		locals.accessToken,
		locals.tenantId,
		fetch
	);

	return json(result);
};
