import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { decideCertificationItem } from '$lib/api/governance';
import type { CertificationDecisionRequest } from '$lib/api/types';

export const POST: RequestHandler = async ({ params, request, locals, fetch }) => {
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
	if (body.decision !== 'approved' && body.decision !== 'revoked') {
		error(400, 'decision is required');
	}
	const data: CertificationDecisionRequest = { decision: body.decision };
	if (body.notes !== undefined) {
		if (typeof body.notes !== 'string') {
			error(400, 'notes must be a string');
		}
		data.notes = body.notes;
	}
	const result = await decideCertificationItem(
		params.id,
		data,
		locals.accessToken,
		locals.tenantId,
		fetch
	);

	return json(result);
};
