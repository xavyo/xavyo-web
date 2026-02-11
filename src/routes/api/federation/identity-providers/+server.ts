import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { hasAdminRole } from '$lib/server/auth';
import { listIdentityProviders, createIdentityProvider } from '$lib/api/federation';

export const GET: RequestHandler = async ({ url, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) {
		error(401, 'Unauthorized');
	}
	if (!hasAdminRole(locals.user?.roles)) {
		error(403, 'Forbidden');
	}

	const offset = Number(url.searchParams.get('offset') ?? '0');
	const limit = Number(url.searchParams.get('limit') ?? '20');
	const isEnabledParam = url.searchParams.get('is_enabled');
	const is_enabled = isEnabledParam !== null ? isEnabledParam === 'true' : undefined;

	const result = await listIdentityProviders(
		{ offset, limit, is_enabled },
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

	const body = await request.json();
	const result = await createIdentityProvider(body, locals.accessToken, locals.tenantId, fetch);
	return json(result, { status: 201 });
};
