import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import {
	getEscalationPolicy,
	updateEscalationPolicy,
	deleteEscalationPolicy
} from '$lib/api/approval-workflows';
import type { UpdateEscalationPolicyRequest } from '$lib/api/types';

export const GET: RequestHandler = async ({ params, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) {
		error(401, 'Unauthorized');
	}

	const result = await getEscalationPolicy(params.id, locals.accessToken, locals.tenantId, fetch);

	return json(result);
};

export const PUT: RequestHandler = async ({ params, request, locals, fetch }) => {
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
	const data: UpdateEscalationPolicyRequest = {};
	if (body.name !== undefined) {
		if (typeof body.name !== 'string' || body.name.length === 0) {
			error(400, 'name must be a non-empty string');
		}
		data.name = body.name;
	}
	if (body.description !== undefined) {
		if (typeof body.description !== 'string') {
			error(400, 'description must be a string');
		}
		data.description = body.description;
	}
	if (body.default_timeout_secs !== undefined) {
		if (typeof body.default_timeout_secs !== 'number') {
			error(400, 'default_timeout_secs must be a number');
		}
		data.default_timeout_secs = body.default_timeout_secs;
	}
	if (body.warning_threshold_secs !== undefined) {
		if (typeof body.warning_threshold_secs !== 'number') {
			error(400, 'warning_threshold_secs must be a number');
		}
		data.warning_threshold_secs = body.warning_threshold_secs;
	}
	if (body.final_fallback !== undefined) {
		if (
			body.final_fallback !== 'escalate_admin' &&
			body.final_fallback !== 'auto_approve' &&
			body.final_fallback !== 'auto_reject' &&
			body.final_fallback !== 'remain_pending'
		) {
			error(400, 'final_fallback must be escalate_admin, auto_approve, auto_reject, or remain_pending');
		}
		data.final_fallback = body.final_fallback;
	}
	if (body.is_active !== undefined) {
		if (typeof body.is_active !== 'boolean') {
			error(400, 'is_active must be a boolean');
		}
		data.is_active = body.is_active;
	}
	const result = await updateEscalationPolicy(
		params.id,
		data,
		locals.accessToken,
		locals.tenantId,
		fetch
	);

	return json(result);
};

export const DELETE: RequestHandler = async ({ params, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) {
		error(401, 'Unauthorized');
	}

	await deleteEscalationPolicy(params.id, locals.accessToken, locals.tenantId, fetch);

	return new Response(null, { status: 204 });
};
