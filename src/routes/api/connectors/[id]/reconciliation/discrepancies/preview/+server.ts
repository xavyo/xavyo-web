import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { previewRemediation } from '$lib/api/reconciliation';
import type { PreviewRemediationRequest } from '$lib/api/types';

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
	if (
		!Array.isArray(body.discrepancy_ids) ||
		body.discrepancy_ids.length === 0 ||
		body.discrepancy_ids.some((id) => typeof id !== 'string' || id.length === 0)
	) {
		error(400, 'discrepancy_ids is required');
	}
	const data: PreviewRemediationRequest = { discrepancy_ids: body.discrepancy_ids as string[] };
	const result = await previewRemediation(
		params.id,
		data,
		locals.accessToken,
		locals.tenantId,
		fetch
	);

	return json(result);
};
