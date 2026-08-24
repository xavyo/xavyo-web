import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { listScriptVersions, createScriptVersion } from '$lib/api/provisioning-scripts';
import type { CreateScriptVersionRequest } from '$lib/api/types';

export const GET: RequestHandler = async ({ params, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) {
		error(401, 'Unauthorized');
	}

	const result = await listScriptVersions(params.id, locals.accessToken, locals.tenantId, fetch);
	return json(result);
};

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
	if (typeof body.script_body !== 'string' || body.script_body.length === 0) {
		error(400, 'script_body is required');
	}
	const data: CreateScriptVersionRequest = { script_body: body.script_body };
	if (body.change_description !== undefined) {
		if (typeof body.change_description !== 'string') {
			error(400, 'change_description must be a string');
		}
		data.change_description = body.change_description;
	}
	const result = await createScriptVersion(
		params.id,
		data,
		locals.accessToken,
		locals.tenantId,
		fetch
	);

	return json(result, { status: 201 });
};
