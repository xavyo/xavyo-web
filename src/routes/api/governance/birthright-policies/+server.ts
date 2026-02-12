import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { listBirthrightPolicies, createBirthrightPolicy } from '$lib/api/birthright';
import { hasAdminRole } from '$lib/server/auth';

export const GET: RequestHandler = async ({ url, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) error(401, 'Unauthorized');
	const status = url.searchParams.get('status') ?? undefined;
	const limit = Number(url.searchParams.get('limit') ?? '50');
	const offset = Number(url.searchParams.get('offset') ?? '0');
	const result = await listBirthrightPolicies({ status, limit, offset }, locals.accessToken, locals.tenantId, fetch);
	return json(result);
};

export const POST: RequestHandler = async ({ request, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) error(401, 'Unauthorized');
	if (!hasAdminRole(locals.user?.roles)) error(403, 'Forbidden');
	const body = await request.json();
	const result = await createBirthrightPolicy(body, locals.accessToken, locals.tenantId, fetch);
	return json(result, { status: 201 });
};
