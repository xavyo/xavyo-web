import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { bulkRemediate } from '$lib/api/reconciliation';
import type { BulkRemediateRequest } from '$lib/api/types';

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
	if (!Array.isArray(body.items) || body.items.length === 0) {
		error(400, 'items is required');
	}
	if (typeof body.dry_run !== 'boolean') {
		error(400, 'dry_run is required');
	}
	const result = await bulkRemediate(
		params.id,
		{ items: body.items as BulkRemediateRequest['items'], dry_run: body.dry_run },
		locals.accessToken,
		locals.tenantId,
		fetch
	);

	return json(result);
};
