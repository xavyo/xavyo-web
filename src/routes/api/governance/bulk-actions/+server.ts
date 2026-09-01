import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { listBulkActions, createBulkAction } from '$lib/api/governance-operations';
import { ApiError } from '$lib/api/client';
import { listPagination } from '$lib/server/list-pagination';

export const GET: RequestHandler = async ({ url, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) {
		error(401, 'Unauthorized');
	}

	try {
		const result = await listBulkActions(
			{
				status: url.searchParams.get('status') ?? undefined,
				action_type: url.searchParams.get('action_type') ?? undefined,
				created_by: url.searchParams.get('created_by') ?? undefined,
				...listPagination(url)
			},
			locals.accessToken,
			locals.tenantId,
			fetch
		);
		return json(result);
	} catch (e) {
		if (e instanceof ApiError) {
			return json({ error: e.message }, { status: e.status });
		}
		return json({ error: 'Failed to list bulk actions' }, { status: 500 });
	}
};

export const POST: RequestHandler = async ({ request, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) {
		error(401, 'Unauthorized');
	}

	try {
		let parsed: unknown;
		try {
			parsed = await request.json();
		} catch {
			return json({ error: 'Invalid JSON body' }, { status: 400 });
		}
		if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
			return json({ error: 'Invalid JSON body' }, { status: 400 });
		}
		const body = parsed as Record<string, unknown>;
		if (typeof body.filter_expression !== 'string' || body.filter_expression.length === 0) {
			return json({ error: 'filter_expression is required' }, { status: 400 });
		}
		if (
			body.action_type !== 'assign_role' &&
			body.action_type !== 'revoke_role' &&
			body.action_type !== 'enable' &&
			body.action_type !== 'disable' &&
			body.action_type !== 'modify_attribute'
		) {
			return json({ error: 'action_type is required' }, { status: 400 });
		}
		if (typeof body.justification !== 'string' || body.justification.length === 0) {
			return json({ error: 'justification is required' }, { status: 400 });
		}
		const result = await createBulkAction(
			{
				filter_expression: body.filter_expression,
				action_type: body.action_type,
				action_params: body.action_params,
				justification: body.justification
			},
			locals.accessToken,
			locals.tenantId,
			fetch
		);
		return json(result, { status: 201 });
	} catch (e) {
		if (e instanceof ApiError) {
			return json({ error: e.message }, { status: e.status });
		}
		return json({ error: 'Failed to create bulk action' }, { status: 500 });
	}
};
