import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { certifyItem } from '$lib/api/my-certifications';

export const POST: RequestHandler = async ({ params, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) {
		error(401, 'Unauthorized');
	}

	const result = await certifyItem(
		params.itemId,
		locals.accessToken,
		locals.tenantId,
		fetch
	);

	return json(result);
};
