import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { hasAdminRole } from '$lib/server/auth';
import { listIdentityProviders, createIdentityProvider } from '$lib/api/federation';
import { listPagination } from '$lib/server/list-pagination';

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
	const result = await createIdentityProvider(
		{
			name: body.name,
			provider_type: body.provider_type,
			issuer_url: body.issuer_url,
			client_id: body.client_id,
			client_secret: body.client_secret,
			scopes: typeof body.scopes === 'string' ? body.scopes : undefined
		},
		locals.accessToken,
		locals.tenantId,
		fetch
	);
	return json(result, { status: 201 });
};
