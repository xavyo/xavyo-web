import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { dryRunScript } from '$lib/api/provisioning-scripts';

export const POST: RequestHandler = async ({ request, locals, fetch }) => {
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
	if (body.context === undefined) {
		error(400, 'context is required');
	}
	const result = await dryRunScript(
		{ context: body.context },
		locals.accessToken,
		locals.tenantId,
		fetch
	);
	return json(result);
};
