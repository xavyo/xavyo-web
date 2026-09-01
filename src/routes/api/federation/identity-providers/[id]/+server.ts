import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import {
	getIdentityProvider,
	updateIdentityProvider,
	deleteIdentityProvider
} from '$lib/api/federation';
import type { UpdateIdentityProviderRequest } from '$lib/api/types';
import { parseClaimMapping } from '$lib/utils/claim-mapping';

export const GET: RequestHandler = async ({ params, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) {
		error(401, 'Unauthorized');
	}

	const result = await getIdentityProvider(params.id, locals.accessToken, locals.tenantId, fetch);
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
	const data: UpdateIdentityProviderRequest = {};
	if (body.name !== undefined) {
		if (typeof body.name !== 'string' || body.name.length === 0) {
			error(400, 'name must be a non-empty string');
		}
		data.name = body.name;
	}
	if (body.provider_type !== undefined) {
		if (typeof body.provider_type !== 'string' || body.provider_type.length === 0) {
			error(400, 'provider_type must be a non-empty string');
		}
		data.provider_type = body.provider_type;
	}
	if (body.issuer_url !== undefined) {
		if (typeof body.issuer_url !== 'string' || body.issuer_url.length === 0) {
			error(400, 'issuer_url must be a non-empty string');
		}
		data.issuer_url = body.issuer_url;
	}
	if (body.client_id !== undefined) {
		if (typeof body.client_id !== 'string' || body.client_id.length === 0) {
			error(400, 'client_id must be a non-empty string');
		}
		data.client_id = body.client_id;
	}
	if (body.client_secret !== undefined) {
		if (typeof body.client_secret !== 'string' || body.client_secret.length === 0) {
			error(400, 'client_secret must be a non-empty string');
		}
		data.client_secret = body.client_secret;
	}
	if (body.scopes !== undefined) {
		if (typeof body.scopes !== 'string') {
			error(400, 'scopes must be a string');
		}
		data.scopes = body.scopes;
	}
	if (body.claim_mapping !== undefined) {
		try {
			data.claim_mapping = parseClaimMapping(body.claim_mapping);
		} catch {
			error(
				400,
				'claim_mapping must be a JSON object of source→target strings or {mappings:[{source,target}]}'
			);
		}
	}
	if (body.sync_on_login !== undefined) {
		if (typeof body.sync_on_login !== 'boolean') {
			error(400, 'sync_on_login must be a boolean');
		}
		data.sync_on_login = body.sync_on_login;
	}
	const result = await updateIdentityProvider(
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

	await deleteIdentityProvider(params.id, locals.accessToken, locals.tenantId, fetch);
	return new Response(null, { status: 204 });
};
