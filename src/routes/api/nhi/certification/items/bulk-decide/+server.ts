import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { bulkDecideNhiCertItems } from '$lib/api/nhi-cert-campaigns';
import { ApiError } from '$lib/api/client';

export const POST: RequestHandler = async ({ locals, request, fetch }) => {
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
		if (!Array.isArray(body.item_ids) || body.item_ids.length === 0) {
			return json({ error: 'item_ids is required' }, { status: 400 });
		}
		if (
			body.decision !== 'certify' &&
			body.decision !== 'revoke' &&
			body.decision !== 'flag'
		) {
			return json({ error: 'decision is required' }, { status: 400 });
		}
		const result = await bulkDecideNhiCertItems(
			{
				item_ids: body.item_ids as string[],
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
