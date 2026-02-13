import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { listMergeAudits } from '$lib/api/dedup';

export const GET: RequestHandler = async ({ url, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) {
		error(401, 'Unauthorized');
	}

	const identity_id = url.searchParams.get('identity_id') ?? undefined;
	const operator_id = url.searchParams.get('operator_id') ?? undefined;
	const from_date = url.searchParams.get('from_date') ?? undefined;
	const to_date = url.searchParams.get('to_date') ?? undefined;
	const limit = Number(url.searchParams.get('limit') ?? '50');
	const offset = Number(url.searchParams.get('offset') ?? '0');

	const result = await listMergeAudits(
		{ identity_id, operator_id, from_date, to_date, limit, offset },
		locals.accessToken,
		locals.tenantId,
		fetch
	);

	return json(result);
};
