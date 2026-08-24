import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { delegateMicroCertification } from '$lib/api/micro-certifications';
import type { DelegateMicroCertificationRequest } from '$lib/api/types';

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
	if (typeof body.delegate_to !== 'string' || body.delegate_to.length === 0) {
		error(400, 'delegate_to is required');
	}
	const data: DelegateMicroCertificationRequest = { delegate_to: body.delegate_to };
	if (body.comment !== undefined) {
		if (typeof body.comment !== 'string') {
			error(400, 'comment must be a string');
		}
		data.comment = body.comment;
	}
	const result = await delegateMicroCertification(
		params.id,
		data,
		locals.accessToken,
		locals.tenantId,
		fetch
	);
	return json(result);
};
