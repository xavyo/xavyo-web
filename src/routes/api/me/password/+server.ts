import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { changePassword } from '$lib/api/me';

export const PUT: RequestHandler = async ({ request, locals, fetch }) => {
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
	if (typeof body.current_password !== 'string' || body.current_password.length === 0) {
		error(400, 'current_password is required');
	}
	if (typeof body.new_password !== 'string' || body.new_password.length === 0) {
		error(400, 'new_password is required');
	}
	const result = await changePassword(
		{
			current_password: body.current_password,
			new_password: body.new_password,
			revoke_other_sessions: body.revoke_other_sessions === true
		},
		locals.accessToken,
		locals.tenantId,
		fetch
	);

	return json(result);
};
