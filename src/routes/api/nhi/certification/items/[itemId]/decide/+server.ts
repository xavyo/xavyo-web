import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { decideNhiCertItem } from '$lib/api/nhi-cert-campaigns';
import { ApiError } from '$lib/api/client';

export const POST: RequestHandler = async ({ locals, params, request, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) return json({ error: 'Unauthorized' }, { status: 401 });
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
		if (
			body.decision !== 'certify' &&
			body.decision !== 'revoke' &&
			body.decision !== 'flag'
		) {
			return json({ error: 'decision is required' }, { status: 400 });
		}
		const result = await decideNhiCertItem(
			params.itemId,
			{
				decision: body.decision,
				notes: typeof body.notes === 'string' ? body.notes : undefined
			},
			locals.accessToken,
			locals.tenantId,
			fetch
		);
		return json(result);
	} catch (e) {
		if (e instanceof ApiError) return json({ error: e.message }, { status: e.status });
		return json({ error: 'Internal error' }, { status: 500 });
	}
};
