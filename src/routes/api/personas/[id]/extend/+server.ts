import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { extendPersona } from '$lib/api/persona-expiry';
import { hasAdminRole } from '$lib/server/auth';
import { ApiError } from '$lib/api/client';
import type { ExtendPersonaRequest } from '$lib/api/types';

export const POST: RequestHandler = async ({ locals, params, request, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) return json({ error: 'Unauthorized' }, { status: 401 });
	if (!hasAdminRole(locals.user?.roles)) return json({ error: 'Forbidden' }, { status: 403 });
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
		if (typeof body.new_valid_until !== 'string' || body.new_valid_until.length === 0) {
			return json({ error: 'new_valid_until is required' }, { status: 400 });
		}
		const data: ExtendPersonaRequest = { new_valid_until: body.new_valid_until };
		if (body.reason !== undefined) {
			if (typeof body.reason !== 'string') {
				return json({ error: 'reason must be a string' }, { status: 400 });
			}
			data.reason = body.reason;
		}
		const result = await extendPersona(params.id, data, locals.accessToken, locals.tenantId, fetch);
		return json(result);
	} catch (e) {
		if (e instanceof ApiError) return json({ error: e.message }, { status: e.status });
		return json({ error: 'Internal error' }, { status: 500 });
	}
};
