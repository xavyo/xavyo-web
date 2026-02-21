import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { listCallees } from '$lib/api/nhi-permissions';
import { ApiError } from '$lib/api/client';

export const GET: RequestHandler = async ({ params, url, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) {
		error(401, 'Unauthorized');
	}

	const limit = Number(url.searchParams.get('limit') ?? '20');
	const offset = Number(url.searchParams.get('offset') ?? '0');

	try {
		const result = await listCallees(
			params.id,
			{ limit, offset },
			locals.accessToken,
			locals.tenantId,
			fetch
		);

		return json(result);
	} catch (e) {
		if (e instanceof ApiError) error(e.status, e.message);
		throw e;
	}
};
