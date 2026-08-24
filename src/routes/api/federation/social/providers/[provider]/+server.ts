import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { hasAdminRole } from '$lib/server/auth';
import { updateSocialProvider, deleteSocialProvider } from '$lib/api/social';
import type { UpdateSocialProviderRequest } from '$lib/api/types';

export const PUT: RequestHandler = async ({ params, request, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) {
		error(401, 'Unauthorized');
	}
	if (!hasAdminRole(locals.user?.roles)) {
		error(403, 'Forbidden');
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
	const data: UpdateSocialProviderRequest = {};
	if (body.enabled !== undefined) {
		if (typeof body.enabled !== 'boolean') {
			error(400, 'enabled must be a boolean');
		}
		data.enabled = body.enabled;
	}
	if (body.client_id !== undefined) {
		if (typeof body.client_id !== 'string') {
			error(400, 'client_id must be a string');
		}
		data.client_id = body.client_id;
	}
	if (body.client_secret !== undefined) {
		if (typeof body.client_secret !== 'string') {
			error(400, 'client_secret must be a string');
		}
		data.client_secret = body.client_secret;
	}
	if (body.scopes !== undefined) {
		if (!Array.isArray(body.scopes) || !body.scopes.every((item) => typeof item === 'string')) {
			error(400, 'scopes must be an array of strings');
		}
		data.scopes = body.scopes;
	}
	if (body.additional_config !== undefined) {
		if (
			!body.additional_config ||
			typeof body.additional_config !== 'object' ||
			Array.isArray(body.additional_config)
		) {
			error(400, 'additional_config must be an object');
		}
		data.additional_config = body.additional_config as Record<string, unknown>;
	}
	const result = await updateSocialProvider(
		params.provider,
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
	if (!hasAdminRole(locals.user?.roles)) {
		error(403, 'Forbidden');
	}

	await deleteSocialProvider(params.provider, locals.accessToken, locals.tenantId, fetch);
	return new Response(null, { status: 204 });
};
