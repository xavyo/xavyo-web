import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { listRoleEntitlements, addRoleEntitlement } from '$lib/api/governance-roles';
import type { AddRoleEntitlementRequest } from '$lib/api/types';

export const GET: RequestHandler = async ({ params, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) {
		error(401, 'Unauthorized');
	}

	const result = await listRoleEntitlements(params.id, locals.accessToken, locals.tenantId, fetch);

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
	if (typeof body.role_name !== 'string' || body.role_name.length === 0) {
		error(400, 'role_name is required');
	}
	const data: AddRoleEntitlementRequest = {
		entitlement_id: body.entitlement_id,
		role_name: body.role_name
	};
	const result = await addRoleEntitlement(
		params.id,
		data,
		locals.accessToken,
		locals.tenantId,
		fetch
	);

	return json(result, { status: 201 });
};
