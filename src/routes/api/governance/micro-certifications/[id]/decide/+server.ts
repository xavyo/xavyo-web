import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { decideMicroCertification } from '$lib/api/micro-certifications';

export const POST: RequestHandler = async ({ params, request, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) error(401, 'Unauthorized');

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
		body.decision !== 'approve' &&
		body.decision !== 'revoke' &&
		body.decision !== 'reduce' &&
		body.decision !== 'delegate'
	) {
		error(400, 'decision is required');
	}
	const result = await decideMicroCertification(
		params.id,
		{
			decision: body.decision,
			comment: typeof body.comment === 'string' ? body.comment : undefined
		},
		locals.accessToken,
		locals.tenantId,
		fetch
	);
	return json(result);
};
