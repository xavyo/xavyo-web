import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { verifyEmailChange } from '$lib/api/me';
import type { EmailVerifyChangeRequest } from '$lib/api/types';

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
	if (typeof body.token !== 'string' || body.token.length === 0) {
		error(400, 'token is required');
	}
	const data: EmailVerifyChangeRequest = { token: body.token };
	const result = await verifyEmailChange(data, locals.accessToken, locals.tenantId, fetch);

	return json(result);
};
