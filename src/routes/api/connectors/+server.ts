import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { listConnectors, createConnector } from '$lib/api/connectors';

export const GET: RequestHandler = async ({ url, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) {
		error(401, 'Unauthorized');
	}

	const name_contains = url.searchParams.get('name_contains') ?? undefined;
	const connector_type = url.searchParams.get('connector_type') ?? undefined;
	const status = url.searchParams.get('status') ?? undefined;
	const limit = Number(url.searchParams.get('limit') ?? '20');
	const offset = Number(url.searchParams.get('offset') ?? '0');

	const result = await listConnectors(
		{ name_contains, connector_type, status, limit, offset },
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
	const result = await createConnector(body, locals.accessToken, locals.tenantId, fetch);

	return json(result, { status: 201 });
};
