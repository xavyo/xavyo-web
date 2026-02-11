import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { listRiskScores } from '$lib/api/risk';

export const GET: RequestHandler = async ({ url, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) {
		error(401, 'Unauthorized');
	}

	const offset = Number(url.searchParams.get('offset') ?? '0');
	const limit = Number(url.searchParams.get('limit') ?? '20');
	const risk_level = url.searchParams.get('risk_level') ?? undefined;
	const sort_by = url.searchParams.get('sort_by') ?? undefined;

	const result = await listRiskScores(
		{ risk_level, sort_by, limit, offset },
		locals.accessToken,
		locals.tenantId,
		fetch
	);

	return json(result);
};
