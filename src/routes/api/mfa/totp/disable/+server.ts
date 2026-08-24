import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { disableTotp } from '$lib/api/mfa';
import { ApiError } from '$lib/api/client';

export const DELETE: RequestHandler = async ({ request, locals, fetch }) => {
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
		if (typeof body.password !== 'string' || body.password.length === 0) {
			return json({ error: 'password is required' }, { status: 400 });
		}
		if (typeof body.code !== 'string' || body.code.length === 0) {
			return json({ error: 'code is required' }, { status: 400 });
		}
		const result = await disableTotp(
			{ password: body.password, code: body.code },
			locals.accessToken,
			locals.tenantId,
			fetch
		);
		return json(result);
	} catch (e) {
		if (e instanceof ApiError) {
			return json({ error: e.message }, { status: e.status });
		}
		return json({ error: 'An unexpected error occurred' }, { status: 500 });
	}
};
