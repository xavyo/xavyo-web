import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { listCandidates } from '$lib/api/role-mining';

export const GET: RequestHandler = async ({ params, url, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) {
		error(401, 'Unauthorized');
	}

	const promotion_status = url.searchParams.get('promotion_status') || undefined;
	const limit = Number(url.searchParams.get('limit') ?? '50');
	const offset = Number(url.searchParams.get('offset') ?? '0');

	const result = await listCandidates(
		params.jobId,
		{ promotion_status, limit, offset },
		locals.accessToken,
		locals.tenantId,
		fetch
	);

	return json(result);
};
