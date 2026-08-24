import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { addEntitlement } from '$lib/api/meta-roles';
import type { AddMetaRoleEntitlementRequest } from '$lib/api/types';

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
	const data: AddMetaRoleEntitlementRequest = { entitlement_id: body.entitlement_id };
	if (body.permission_type !== undefined) {
		if (body.permission_type !== 'grant' && body.permission_type !== 'deny') {
			error(400, 'permission_type must be grant or deny');
		}
		data.permission_type = body.permission_type;
	}
	const result = await addEntitlement(params.id, data, locals.accessToken, locals.tenantId, fetch);

	return json(result, { status: 201 });
};
