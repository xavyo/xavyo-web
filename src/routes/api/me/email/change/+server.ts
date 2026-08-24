import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { initiateEmailChange } from '$lib/api/me';

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
	if (typeof body.new_email !== 'string' || body.new_email.length === 0) {
		error(400, 'new_email is required');
	}
	if (typeof body.current_password !== 'string' || body.current_password.length === 0) {
		error(400, 'current_password is required');
	}
	const result = await initiateEmailChange(
		{ new_email: body.new_email, current_password: body.current_password },
		locals.accessToken,
		locals.tenantId,
		fetch
	);

	return json(result);
};
