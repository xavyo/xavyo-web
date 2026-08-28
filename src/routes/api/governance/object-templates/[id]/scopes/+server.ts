import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { listTemplateScopes, createTemplateScope } from '$lib/api/object-templates';
import { ApiError } from '$lib/api/client';

export const GET: RequestHandler = async ({ params, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) error(401, 'Unauthorized');

	try {
		const result = await listTemplateScopes(params.id, locals.accessToken, locals.tenantId, fetch);
		return json(result);
	} catch (e) {
		if (e instanceof ApiError) error(e.status, e.message);
		throw e;
	}
};

export const POST: RequestHandler = async ({ params, request, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) error(401, 'Unauthorized');

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
	if (
		body.scope_type !== 'global' &&
		body.scope_type !== 'organization' &&
		body.scope_type !== 'category' &&
		body.scope_type !== 'condition'
	) {
		error(400, 'scope_type is required');
	}
	const data: Record<string, unknown> = { scope_type: body.scope_type };
	if (body.scope_value !== undefined) {
		if (typeof body.scope_value !== 'string') {
			error(400, 'scope_value must be a string');
		}
		data.scope_value = body.scope_value;
	}
	if (body.condition !== undefined) {
		if (typeof body.condition !== 'string') {
			error(400, 'condition must be a string');
		}
		data.condition = body.condition;
	}
	try {
		const result = await createTemplateScope(params.id, data, locals.accessToken, locals.tenantId, fetch);
		return json(result, { status: 201 });
	} catch (e) {
		if (e instanceof ApiError) error(e.status, e.message);
		throw e;
	}
};
