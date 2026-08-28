import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { listLifecycleConfigs, createLifecycleConfig } from '$lib/api/lifecycle';
import { hasAdminRole } from '$lib/server/auth';
import type { CreateLifecycleConfigRequest, LifecycleObjectType } from '$lib/api/types';
import { listPagination } from '$lib/server/list-pagination';

const OBJECT_TYPES = ['user', 'entitlement', 'role'] as const;

export const GET: RequestHandler = async ({ url, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) error(401, 'Unauthorized');
	const object_type = url.searchParams.get('object_type') ?? undefined;
	const is_active_raw = url.searchParams.get('is_active');
	const is_active = is_active_raw !== null ? is_active_raw === 'true' : undefined;
	const result = await listLifecycleConfigs(
		{ object_type, is_active, ...listPagination(url) },
		locals.accessToken,
		locals.tenantId,
		fetch
	);
	return json(result);
};

export const POST: RequestHandler = async ({ request, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) error(401, 'Unauthorized');
	if (!hasAdminRole(locals.user?.roles)) error(403, 'Forbidden');
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
	if (!OBJECT_TYPES.includes(body.object_type as (typeof OBJECT_TYPES)[number])) {
		error(400, 'object_type is required');
	}
	const data: CreateLifecycleConfigRequest = {
		name: body.name,
		object_type: body.object_type as LifecycleObjectType
	};
	if (body.description !== undefined) {
		if (typeof body.description !== 'string') {
			error(400, 'description must be a string');
		}
		data.description = body.description;
	}
	if (body.auto_assign_initial_state !== undefined) {
		if (typeof body.auto_assign_initial_state !== 'boolean') {
			error(400, 'auto_assign_initial_state must be a boolean');
		}
		data.auto_assign_initial_state = body.auto_assign_initial_state;
	}
	const result = await createLifecycleConfig(data, locals.accessToken, locals.tenantId, fetch);
	return json(result, { status: 201 });
};
