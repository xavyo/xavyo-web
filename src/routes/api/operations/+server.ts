import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { listOperations, triggerOperation } from '$lib/api/operations';

export const GET: RequestHandler = async ({ url, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) {
		error(401, 'Unauthorized');
	}

	const connector_id = url.searchParams.get('connector_id') ?? undefined;
	const user_id = url.searchParams.get('user_id') ?? undefined;
	const status = url.searchParams.get('status') ?? undefined;
	const operation_type = url.searchParams.get('operation_type') ?? undefined;
	const from_date = url.searchParams.get('from_date') ?? undefined;
	const to_date = url.searchParams.get('to_date') ?? undefined;
	const limit = Number(url.searchParams.get('limit') ?? '20');
	const offset = Number(url.searchParams.get('offset') ?? '0');

	const result = await listOperations(
		{ connector_id, user_id, status, operation_type, from_date, to_date, limit, offset },
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
	const result = await triggerOperation(body, locals.accessToken, locals.tenantId, fetch);

	return json(result, { status: 201 });
};
