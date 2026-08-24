import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { listMappings, createMapping } from '$lib/api/authorization';

export const GET: RequestHandler = async ({ url, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) {
		error(401, 'Unauthorized');
	}

	const offset = Number(url.searchParams.get('offset') ?? '0');
	const limit = Number(url.searchParams.get('limit') ?? '20');

	const result = await listMappings(
		{ limit, offset },
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
	if (typeof body.entitlement_id !== 'string' || body.entitlement_id.length === 0) {
		error(400, 'entitlement_id is required');
	}
	if (typeof body.action !== 'string' || body.action.length === 0) {
		error(400, 'action is required');
	}
	if (typeof body.resource_type !== 'string' || body.resource_type.length === 0) {
		error(400, 'resource_type is required');
	}
	const result = await createMapping(
		{
			entitlement_id: body.entitlement_id,
			action: body.action,
			resource_type: body.resource_type
		},
		locals.accessToken,
		locals.tenantId,
		fetch
	);

	return json(result, { status: 201 });
};
