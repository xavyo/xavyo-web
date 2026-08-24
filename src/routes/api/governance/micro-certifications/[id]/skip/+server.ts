import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { skipMicroCertification } from '$lib/api/micro-certifications';
import type { SkipMicroCertificationRequest } from '$lib/api/types';

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
	if (typeof body.reason !== 'string' || body.reason.length === 0) {
		error(400, 'reason is required');
	}
	const data: SkipMicroCertificationRequest = { reason: body.reason };
	const result = await skipMicroCertification(
		params.id,
		data,
		locals.accessToken,
		locals.tenantId,
		fetch
	);
	return json(result);
};
