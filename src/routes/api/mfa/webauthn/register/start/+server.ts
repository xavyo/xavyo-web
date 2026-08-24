import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { startWebauthnRegistration } from '$lib/api/mfa';
import { ApiError } from '$lib/api/client';
import type { StartRegistrationRequest } from '$lib/api/types';

export const POST: RequestHandler = async ({ request, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) {
		error(401, 'Unauthorized');
	}

	try {
		let parsed: unknown;
		try {
			parsed = await request.json();
		} catch {
			return json({ error: 'Invalid JSON body' }, { status: 400 });
		}
		if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
			return json({ error: 'Invalid JSON body' }, { status: 400 });
		}
		const body = parsed as Record<string, unknown>;
		const data: StartRegistrationRequest = {};
		if (body.name !== undefined) {
			if (typeof body.name !== 'string' || body.name.length === 0) {
				return json({ error: 'name must be a non-empty string' }, { status: 400 });
			}
			data.name = body.name;
		}
		const result = await startWebauthnRegistration(data, locals.accessToken, locals.tenantId, fetch);
		return json(result);
	} catch (e) {
		if (e instanceof ApiError) {
			return json({ error: e.message }, { status: e.status });
		}
		return json({ error: 'An unexpected error occurred' }, { status: 500 });
	}
};
