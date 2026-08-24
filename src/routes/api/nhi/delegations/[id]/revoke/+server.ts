import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { revokeDelegationGrant } from '$lib/api/nhi-delegations';
import { ApiError } from '$lib/api/client';

export const POST: RequestHandler = async ({ locals, params, request, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}
	try {
		const text = await request.text();
		let body: Record<string, unknown> = {};
		if (text.trim()) {
			try {
				const parsed = JSON.parse(text) as unknown;
				if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
					return json({ error: 'Invalid JSON body' }, { status: 400 });
				}
				body = parsed as Record<string, unknown>;
			} catch {
				return json({ error: 'Invalid JSON body' }, { status: 400 });
			}
		}
		const result = await revokeDelegationGrant(params.id, body, locals.accessToken, locals.tenantId, fetch);
		return json(result);
	} catch (e) {
		if (e instanceof ApiError) return json({ error: e.message }, { status: e.status });
		return json({ error: 'Internal error' }, { status: 500 });
	}
};
