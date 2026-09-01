import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { listOAuthClients, createOAuthClient } from '$lib/api/oauth-clients';
import { applyOAuthAdvertisedFields } from '$lib/server/oauth-client-fields';
import type { CreateOAuthClientRequest } from '$lib/api/types';

export const GET: RequestHandler = async ({ locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) {
		error(401, 'Unauthorized');
	}

	const result = await listOAuthClients(locals.accessToken, locals.tenantId, fetch);

	return json(result);
};

export const POST: RequestHandler = async ({ request, locals, fetch }) => {
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
	if (typeof body.name !== 'string' || body.name.length === 0) {
		error(400, 'name is required');
	}
	if (body.client_type !== 'confidential' && body.client_type !== 'public') {
		error(400, 'client_type is required');
	}
	if (!Array.isArray(body.redirect_uris) || body.redirect_uris.length === 0) {
		error(400, 'redirect_uris is required');
	}
	if (!Array.isArray(body.grant_types) || body.grant_types.length === 0) {
		error(400, 'grant_types is required');
	}
	if (!Array.isArray(body.scopes) || body.scopes.length === 0) {
		error(400, 'scopes is required');
	}
	if (!body.redirect_uris.every((item) => typeof item === 'string')) {
		error(400, 'redirect_uris must be an array of strings');
	}
	if (!body.grant_types.every((item) => typeof item === 'string')) {
		error(400, 'grant_types must be an array of strings');
	}
	if (!body.scopes.every((item) => typeof item === 'string')) {
		error(400, 'scopes must be an array of strings');
	}
	const data: CreateOAuthClientRequest = {
		name: body.name,
		client_type: body.client_type,
		redirect_uris: body.redirect_uris,
		grant_types: body.grant_types,
		scopes: body.scopes,
		logo_url: typeof body.logo_url === 'string' ? body.logo_url : undefined,
		description: typeof body.description === 'string' ? body.description : undefined
	};
	applyOAuthAdvertisedFields(body, data);
	const result = await createOAuthClient(
		data,
		locals.accessToken,
		locals.tenantId,
		fetch
	);

	return json(result, { status: 201 });
};
