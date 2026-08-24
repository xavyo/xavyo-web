import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { apiClient } from '$lib/api/client';
import type { LinkAccountRequest } from '$lib/api/types';

export const POST: RequestHandler = async ({ request, params, locals, fetch }) => {
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
	if (typeof body.code !== 'string' || body.code.length === 0) {
		error(400, 'code is required');
	}
	if (typeof body.state !== 'string' || body.state.length === 0) {
		error(400, 'state is required');
	}
	const data: LinkAccountRequest = { code: body.code, state: body.state };
	const result = await apiClient(`/auth/social/link/${params.provider}`, {
		method: 'POST',
		body: data,
		token: locals.accessToken,
		tenantId: locals.tenantId,
		fetch
	});
	return json(result);
};
