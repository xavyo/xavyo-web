import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { listSodViolations } from '$lib/api/governance';

export const GET: RequestHandler = async ({ url, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) {
		error(401, 'Unauthorized');
	}

	const offset = Number(url.searchParams.get('offset') ?? '0');
	const limit = Number(url.searchParams.get('limit') ?? '20');

	const result = await listSodViolations(
		{ limit, offset },
		locals.accessToken,
		locals.tenantId,
		fetch
	);

	return json(result);
};
