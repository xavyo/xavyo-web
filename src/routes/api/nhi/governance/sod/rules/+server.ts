import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { listNhiSodRules, createNhiSodRule } from '$lib/api/nhi-governance';
import { ApiError } from '$lib/api/client';
import { hasAdminRole } from '$lib/server/auth';
import type { CreateNhiSodRuleRequest } from '$lib/api/types';
import { listPagination } from '$lib/server/list-pagination';

export const GET: RequestHandler = async ({ url, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) {
		error(401, 'Unauthorized');
	}
	if (!hasAdminRole(locals.user?.roles)) {
		error(403, 'Forbidden');
	}

	try {
		const result = await listNhiSodRules(
			{ ...listPagination(url) },
			locals.accessToken,
			locals.tenantId,
			fetch
		);
		return json(result);
	} catch (e) {
		if (e instanceof ApiError) error(e.status, e.message);
		throw e;
	}
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
	if (typeof body.tool_id_a !== 'string' || body.tool_id_a.length === 0) {
		error(400, 'tool_id_a is required');
	}
	if (typeof body.tool_id_b !== 'string' || body.tool_id_b.length === 0) {
		error(400, 'tool_id_b is required');
	}
	if (body.enforcement !== 'prevent' && body.enforcement !== 'warn') {
		error(400, 'enforcement is required');
	}
	const data: CreateNhiSodRuleRequest = {
		tool_id_a: body.tool_id_a,
		tool_id_b: body.tool_id_b,
		enforcement: body.enforcement
	};
	if (body.description !== undefined) {
		if (typeof body.description !== 'string') {
			error(400, 'description must be a string');
		}
		data.description = body.description;
	}

	try {
		const result = await createNhiSodRule(data, locals.accessToken, locals.tenantId, fetch);
		return json(result, { status: 201 });
	} catch (e) {
		if (e instanceof ApiError) error(e.status, e.message);
		throw e;
	}
};
