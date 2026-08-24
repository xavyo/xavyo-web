import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { hasAdminRole } from '$lib/server/auth';
import { listObjectTemplates, createObjectTemplate } from '$lib/api/object-templates';
import { ApiError } from '$lib/api/client';

const OBJECT_TYPES = ['user', 'role', 'entitlement', 'application'] as const;

export const GET: RequestHandler = async ({ url, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) error(401, 'Unauthorized');
	if (!hasAdminRole(locals.user?.roles)) error(403, 'Forbidden');

	const params = {
		object_type: url.searchParams.get('object_type') ?? undefined,
		status: url.searchParams.get('status') ?? undefined,
		name: url.searchParams.get('name') ?? undefined,
		offset: Number(url.searchParams.get('offset') ?? '0'),
		limit: Number(url.searchParams.get('limit') ?? '20')
	};

	try {
		const result = await listObjectTemplates(params, locals.accessToken, locals.tenantId, fetch);
		return json(result);
	} catch (e) {
		if (e instanceof ApiError) error(e.status, e.message);
		throw e;
	}
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
	const data: Record<string, unknown> = {
		name: body.name,
		object_type: body.object_type
	};
	if (body.description !== undefined) {
		if (typeof body.description !== 'string') {
			error(400, 'description must be a string');
		}
		data.description = body.description;
	}
	if (body.priority !== undefined) {
		if (typeof body.priority !== 'number') {
			error(400, 'priority must be a number');
		}
		data.priority = body.priority;
	}
	if (body.parent_template_id !== undefined) {
		if (body.parent_template_id !== null && typeof body.parent_template_id !== 'string') {
			error(400, 'parent_template_id must be a string or null');
		}
		data.parent_template_id = body.parent_template_id;
	}
	if (body.rules !== undefined) {
		if (!Array.isArray(body.rules)) {
			error(400, 'rules must be an array');
		}
		data.rules = body.rules;
	}
	if (body.scopes !== undefined) {
		if (!Array.isArray(body.scopes)) {
			error(400, 'scopes must be an array');
		}
		data.scopes = body.scopes;
	}
	try {
		const result = await createObjectTemplate(data, locals.accessToken, locals.tenantId, fetch);
		return json(result, { status: 201 });
	} catch (e) {
		if (e instanceof ApiError) error(e.status, e.message);
		throw e;
	}
};
