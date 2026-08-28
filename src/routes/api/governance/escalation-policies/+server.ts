import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { listEscalationPolicies, createEscalationPolicy } from '$lib/api/approval-workflows';
import type { CreateEscalationPolicyRequest } from '$lib/api/types';
import { listPagination } from '$lib/server/list-pagination';

export const GET: RequestHandler = async ({ url, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) {
		error(401, 'Unauthorized');
	}

	const result = await listEscalationPolicies(
		listPagination(url),
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
	if (typeof body.default_timeout_secs !== 'number') {
		error(400, 'default_timeout_secs is required');
	}
	if (
		body.final_fallback !== 'escalate_admin' &&
		body.final_fallback !== 'auto_approve' &&
		body.final_fallback !== 'auto_reject' &&
		body.final_fallback !== 'remain_pending'
	) {
		error(400, 'final_fallback is required');
	}
	const data: CreateEscalationPolicyRequest = {
		name: body.name,
		default_timeout_secs: body.default_timeout_secs,
		final_fallback: body.final_fallback
	};
	if (body.description !== undefined) {
		if (typeof body.description !== 'string') {
			error(400, 'description must be a string');
		}
		data.description = body.description;
	}
	if (body.warning_threshold_secs !== undefined) {
		if (typeof body.warning_threshold_secs !== 'number') {
			error(400, 'warning_threshold_secs must be a number');
		}
		data.warning_threshold_secs = body.warning_threshold_secs;
	}
	const result = await createEscalationPolicy(data, locals.accessToken, locals.tenantId, fetch);

	return json(result, { status: 201 });
};
