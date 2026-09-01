import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { listIdentityProviders, createIdentityProvider } from '$lib/api/federation';
import type { CreateIdentityProviderRequest } from '$lib/api/types';
import { listPagination } from '$lib/server/list-pagination';
import { parseClaimMapping } from '$lib/utils/claim-mapping';

export const GET: RequestHandler = async ({ url, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) {
		error(401, 'Unauthorized');
	}

	const isEnabledParam = url.searchParams.get('is_enabled');
	const is_enabled = isEnabledParam !== null ? isEnabledParam === 'true' : undefined;

	const result = await listIdentityProviders(
		{ is_enabled, ...listPagination(url) },
		locals.accessToken,
		locals.tenantId,
		fetch
	);
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
	if (typeof body.provider_type !== 'string' || body.provider_type.length === 0) {
		error(400, 'provider_type is required');
	}
	if (typeof body.issuer_url !== 'string' || body.issuer_url.length === 0) {
		error(400, 'issuer_url is required');
	}
	if (typeof body.client_id !== 'string' || body.client_id.length === 0) {
		error(400, 'client_id is required');
	}
	if (typeof body.client_secret !== 'string' || body.client_secret.length === 0) {
		error(400, 'client_secret is required');
	}
	let claim_mapping: CreateIdentityProviderRequest['claim_mapping'];
	if (body.claim_mapping !== undefined) {
		try {
			claim_mapping = parseClaimMapping(body.claim_mapping);
		} catch {
			error(400, 'claim_mapping must be a JSON object of source→target strings or {mappings:[{source,target}]}');
		}
	}
	if (body.sync_on_login !== undefined && typeof body.sync_on_login !== 'boolean') {
		error(400, 'sync_on_login must be a boolean');
	}
	if (body.domains !== undefined) {
		if (!Array.isArray(body.domains) || !body.domains.every((d) => typeof d === 'string')) {
			error(400, 'domains must be an array of strings');
		}
	}
	const result = await createIdentityProvider(
		{
			name: body.name,
			provider_type: body.provider_type,
			issuer_url: body.issuer_url,
			client_id: body.client_id,
			client_secret: body.client_secret,
			scopes: typeof body.scopes === 'string' ? body.scopes : undefined,
			claim_mapping,
			sync_on_login: typeof body.sync_on_login === 'boolean' ? body.sync_on_login : undefined,
			domains: Array.isArray(body.domains) ? (body.domains as string[]) : undefined
		},
		locals.accessToken,
		locals.tenantId,
		fetch
	);
	return json(result, { status: 201 });
};
