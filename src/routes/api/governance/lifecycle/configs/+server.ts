import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { listLifecycleConfigs, createLifecycleConfig } from '$lib/api/lifecycle';
import { hasAdminRole } from '$lib/server/auth';

export const GET: RequestHandler = async ({ url, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) error(401, 'Unauthorized');
	const object_type = url.searchParams.get('object_type') ?? undefined;
	const is_active_raw = url.searchParams.get('is_active');
	const is_active = is_active_raw !== null ? is_active_raw === 'true' : undefined;
	const limit = Number(url.searchParams.get('limit') ?? '50');
	const offset = Number(url.searchParams.get('offset') ?? '0');
	const result = await listLifecycleConfigs({ object_type, is_active, limit, offset }, locals.accessToken, locals.tenantId, fetch);
	return json(result);
};

export const POST: RequestHandler = async ({ request, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) error(401, 'Unauthorized');
	if (!hasAdminRole(locals.user?.roles)) error(403, 'Forbidden');
	const body = await request.json();
	const result = await createLifecycleConfig(body, locals.accessToken, locals.tenantId, fetch);
	return json(result, { status: 201 });
};
