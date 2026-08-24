import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { listInheritanceBlocks, addInheritanceBlock } from '$lib/api/governance-roles';
import type { AddInheritanceBlockRequest } from '$lib/api/types';

export const GET: RequestHandler = async ({ params, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) {
		error(401, 'Unauthorized');
	}

	const result = await listInheritanceBlocks(params.id, locals.accessToken, locals.tenantId, fetch);

	return json(result);
};

export const POST: RequestHandler = async ({ params, request, locals, fetch }) => {
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
	const data: AddInheritanceBlockRequest = { entitlement_id: body.entitlement_id };
	const result = await addInheritanceBlock(
		params.id,
		data,
		locals.accessToken,
		locals.tenantId,
		fetch
	);

	return json(result, { status: 201 });
};
