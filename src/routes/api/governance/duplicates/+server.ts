import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { listDuplicates, detectDuplicates } from '$lib/api/dedup';

export const GET: RequestHandler = async ({ url, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) {
		error(401, 'Unauthorized');
	}

	const status = url.searchParams.get('status') ?? undefined;
	const min_confidence = url.searchParams.get('min_confidence')
		? Number(url.searchParams.get('min_confidence'))
		: undefined;
	const max_confidence = url.searchParams.get('max_confidence')
		? Number(url.searchParams.get('max_confidence'))
		: undefined;
	const identity_id = url.searchParams.get('identity_id') ?? undefined;
	const limit = Number(url.searchParams.get('limit') ?? '50');
	const offset = Number(url.searchParams.get('offset') ?? '0');

	const result = await listDuplicates(
		{
			status: status as 'pending' | 'merged' | 'dismissed' | undefined,
			min_confidence,
			max_confidence,
			identity_id,
			limit,
			offset
		},
		locals.accessToken,
		locals.tenantId,
		fetch
	);

	return json(result);
};

export const POST: RequestHandler = async ({ request, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) {
		error(401, 'Unauthorized');
	}

	const body = await request.json();
	const result = await detectDuplicates(
		body.min_confidence,
		locals.accessToken,
		locals.tenantId,
		fetch
	);

	return json(result);
};
