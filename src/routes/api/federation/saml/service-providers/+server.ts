import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { listServiceProviders, createServiceProvider } from '$lib/api/federation';
import { hasAdminRole } from '$lib/server/auth';

export const GET: RequestHandler = async ({ url, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) {
		error(401, 'Unauthorized');
	}

	if (!hasAdminRole(locals.user?.roles)) {
		error(403, 'Forbidden');
	}

	const offset = Number(url.searchParams.get('offset') ?? '0');
	const limit = Number(url.searchParams.get('limit') ?? '20');
	const enabledParam = url.searchParams.get('enabled');
	const enabled = enabledParam !== null ? enabledParam === 'true' : undefined;

	const result = await listServiceProviders(
		{ offset, limit, enabled },
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
	const result = await createServiceProvider(body, locals.accessToken, locals.tenantId, fetch);

	return json(result, { status: 201 });
};
