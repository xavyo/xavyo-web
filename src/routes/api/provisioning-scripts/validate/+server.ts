import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { validateScript } from '$lib/api/provisioning-scripts';

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
	if (typeof body.script_body !== 'string' || body.script_body.length === 0) {
		error(400, 'script_body is required');
	}
	const result = await validateScript(
		{ script_body: body.script_body },
		locals.accessToken,
		locals.tenantId,
		fetch
	);
	return json(result);
};
