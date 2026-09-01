import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getOAuthClient, updateOAuthClient, deleteOAuthClient } from '$lib/api/oauth-clients';
import type { UpdateOAuthClientRequest } from '$lib/api/types';
import { applyOAuthAdvertisedFields } from '$lib/server/oauth-client-fields';

function stringArray(value: unknown, field: string): string[] {
	if (!Array.isArray(value) || !value.every((item) => typeof item === 'string')) {
		error(400, `${field} must be an array of strings`);
	}
	return value;
}

export const GET: RequestHandler = async ({ params, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) {
		error(401, 'Unauthorized');
	}

	const result = await getOAuthClient(params.id, locals.accessToken, locals.tenantId, fetch);

	return json(result);
};

export const PUT: RequestHandler = async ({ params, request, locals, fetch }) => {
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
	const data: UpdateOAuthClientRequest = {};
	if (body.name !== undefined) {
		if (typeof body.name !== 'string' || body.name.length === 0) {
			error(400, 'name must be a non-empty string');
		}
		data.name = body.name;
	}
	if (body.redirect_uris !== undefined) {
		data.redirect_uris = stringArray(body.redirect_uris, 'redirect_uris');
	}
	if (body.grant_types !== undefined) {
		data.grant_types = stringArray(body.grant_types, 'grant_types');
	}
	if (body.scopes !== undefined) {
		data.scopes = stringArray(body.scopes, 'scopes');
	}
	if (body.is_active !== undefined) {
		if (typeof body.is_active !== 'boolean') {
			error(400, 'is_active must be a boolean');
		}
		data.is_active = body.is_active;
	}
	if (body.logo_url !== undefined) {
		if (typeof body.logo_url !== 'string') {
			error(400, 'logo_url must be a string');
		}
		data.logo_url = body.logo_url;
	}
	if (body.description !== undefined) {
		if (typeof body.description !== 'string') {
			error(400, 'description must be a string');
		}
		data.description = body.description;
	}
	applyOAuthAdvertisedFields(body, data);
	const result = await updateOAuthClient(
		params.id,
		data,
		locals.accessToken,
		locals.tenantId,
		fetch
	);

	return json(result);
};

export const DELETE: RequestHandler = async ({ params, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) {
		error(401, 'Unauthorized');
	}

	await deleteOAuthClient(params.id, locals.accessToken, locals.tenantId, fetch);

	return new Response(null, { status: 204 });
};
