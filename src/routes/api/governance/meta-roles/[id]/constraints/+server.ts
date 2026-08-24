import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { addConstraint } from '$lib/api/meta-roles';
import type { AddMetaRoleConstraintRequest } from '$lib/api/types';

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
	if (
		body.constraint_type !== 'max_session_duration' &&
		body.constraint_type !== 'require_mfa' &&
		body.constraint_type !== 'ip_whitelist' &&
		body.constraint_type !== 'approval_required'
	) {
		error(400, 'constraint_type is required');
	}
	if (
		!body.constraint_value ||
		typeof body.constraint_value !== 'object' ||
		Array.isArray(body.constraint_value)
	) {
		error(400, 'constraint_value is required');
	}
	const data: AddMetaRoleConstraintRequest = {
		constraint_type: body.constraint_type,
		constraint_value: body.constraint_value as Record<string, unknown>
	};
	const result = await addConstraint(params.id, data, locals.accessToken, locals.tenantId, fetch);

	return json(result, { status: 201 });
};
