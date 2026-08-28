import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { listBatchSimulations, createBatchSimulation } from '$lib/api/simulations';
import { ApiError } from '$lib/api/client';
import { hasAdminRole } from '$lib/server/auth';
import { listPagination } from '$lib/server/list-pagination';

const BATCH_TYPES = ['role_add', 'role_remove', 'entitlement_add', 'entitlement_remove'] as const;

export const GET: RequestHandler = async ({ url, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) error(401, 'Unauthorized');

	try {
		const batch_type = url.searchParams.get('batch_type') || undefined;
		const status = url.searchParams.get('status') || undefined;
		const created_by = url.searchParams.get('created_by') || undefined;
		const include_archived = url.searchParams.get('include_archived') === 'true' ? true : undefined;
		const result = await listBatchSimulations(
			{ batch_type, status, created_by, include_archived, ...listPagination(url) },
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
	if (!BATCH_TYPES.includes(body.batch_type as (typeof BATCH_TYPES)[number])) {
		error(400, 'batch_type is required');
	}
	if (body.selection_mode !== 'user_list' && body.selection_mode !== 'filter') {
		error(400, 'selection_mode is required');
	}
	if (!body.change_spec || typeof body.change_spec !== 'object' || Array.isArray(body.change_spec)) {
		error(400, 'change_spec is required');
	}
	const data: Record<string, unknown> = {
		name: body.name,
		batch_type: body.batch_type,
		selection_mode: body.selection_mode,
		change_spec: body.change_spec
	};
	if (body.user_ids !== undefined && body.user_ids !== null) {
		if (!Array.isArray(body.user_ids) || !body.user_ids.every((id) => typeof id === 'string')) {
			error(400, 'user_ids must be an array of strings');
		}
		data.user_ids = body.user_ids;
	}
	if (body.filter_criteria !== undefined) {
		if (
			body.filter_criteria !== null &&
			(typeof body.filter_criteria !== 'object' || Array.isArray(body.filter_criteria))
		) {
			error(400, 'filter_criteria must be an object');
		}
		data.filter_criteria = body.filter_criteria;
	}

	try {
		const result = await createBatchSimulation(data, locals.accessToken, locals.tenantId, fetch);
		return json(result, { status: 201 });
	} catch (e) {
		if (e instanceof ApiError) error(e.status, e.message);
		throw e;
	}
};
