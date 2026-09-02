import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { decideNhiCertItem } from '$lib/api/nhi-governance';
import { ApiError } from '$lib/api/client';

export const POST: RequestHandler = async ({ params, request, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) {
		error(401, 'Unauthorized');
	}

	try {
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
		if (
			body.decision !== 'certify' &&
			body.decision !== 'revoke' &&
			body.decision !== 'delegate'
		) {
			error(400, 'Invalid decision. Must be "certify", "revoke", or "delegate".');
		}
		let notes: string | undefined;
		if (body.notes !== undefined) {
			if (typeof body.notes !== 'string') {
				error(400, 'notes must be a string');
			}
			notes = body.notes;
		}
		if (body.comment !== undefined) {
			if (typeof body.comment !== 'string') {
				error(400, 'comment must be a string');
			}
			notes = notes ?? body.comment;
		}
		let delegate_to: string | undefined;
		if (body.delegate_to !== undefined) {
			if (typeof body.delegate_to !== 'string' || body.delegate_to.length === 0) {
				error(400, 'delegate_to must be a string');
			}
			delegate_to = body.delegate_to;
		}
		if (body.decision === 'delegate' && !delegate_to) {
			error(400, 'delegate_to is required');
		}
		const result = await decideNhiCertItem(
			params.itemId,
			{ decision: body.decision, notes, delegate_to },
			locals.accessToken,
			locals.tenantId,
			fetch
		);
		return json(result);
	} catch (e) {
		if (e instanceof ApiError) error(e.status, e.message);
		throw e;
	}
};
