import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { cascadeMetaRole } from '$lib/api/meta-roles';
import type { CascadeMetaRoleRequest } from '$lib/api/types';

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
	if (typeof body.meta_role_id !== 'string' || body.meta_role_id.length === 0) {
		error(400, 'meta_role_id is required');
	}
	const data: CascadeMetaRoleRequest = { meta_role_id: body.meta_role_id };
	if (body.dry_run !== undefined) {
		if (typeof body.dry_run !== 'boolean') {
			error(400, 'dry_run must be a boolean');
		}
		data.dry_run = body.dry_run;
	}
	const result = await cascadeMetaRole(params.id, data, locals.accessToken, locals.tenantId, fetch);

	return json(result, { status: 202 });
};
