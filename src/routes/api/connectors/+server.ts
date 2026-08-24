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

	let parsed: unknown;
	try {
		parsed = await request.json();
	} catch {
		error(400, 'Invalid JSON body');
	}
	if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
		error(400, 'Invalid JSON body');
	}
	const body = parsed as Record<string, unknown>;
	if (typeof body.name !== 'string' || body.name.length === 0) {
		error(400, 'name is required');
	}
	if (body.connector_type !== 'ldap' && body.connector_type !== 'database' && body.connector_type !== 'rest') {
		error(400, 'connector_type is required');
	}
	if (!body.config || typeof body.config !== 'object' || Array.isArray(body.config)) {
		error(400, 'config is required');
	}
	if (!body.credentials || typeof body.credentials !== 'object' || Array.isArray(body.credentials)) {
		error(400, 'credentials is required');
	}
	const result = await createConnector(
		{
			name: body.name,
			connector_type: body.connector_type,
			config: body.config as Record<string, unknown>,
			credentials: body.credentials as Record<string, unknown>,
			description: typeof body.description === 'string' ? body.description : undefined
		},
		locals.accessToken,
		locals.tenantId,
		fetch
	);

	return json(result, { status: 201 });
};
