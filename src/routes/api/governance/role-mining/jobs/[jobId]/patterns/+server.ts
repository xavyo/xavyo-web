import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { listAccessPatterns } from '$lib/api/role-mining';

export const GET: RequestHandler = async ({ params, url, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) {
		error(401, 'Unauthorized');
	}

	const min_frequency = url.searchParams.get('min_frequency')
		? Number(url.searchParams.get('min_frequency'))
		: undefined;
	const limit = Number(url.searchParams.get('limit') ?? '50');
	const offset = Number(url.searchParams.get('offset') ?? '0');

	const result = await listAccessPatterns(
		params.jobId,
		{ min_frequency, limit, offset },
		locals.accessToken,
		locals.tenantId,
		fetch
	);

	return json(result);
};
