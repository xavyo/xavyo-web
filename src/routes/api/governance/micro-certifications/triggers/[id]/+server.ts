import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import {
	getTriggerRule,
	updateTriggerRule,
	deleteTriggerRule
} from '$lib/api/micro-certifications';
import type { ReviewerType, ScopeType, TriggerType, UpdateTriggerRuleRequest } from '$lib/api/types';

const TRIGGER_TYPES = [
	'high_risk_assignment',
	'sod_violation',
	'manager_change',
	'periodic_recert',
	'manual'
] as const;
const SCOPE_TYPES = ['tenant', 'application', 'entitlement'] as const;
const REVIEWER_TYPES = [
	'user_manager',
	'entitlement_owner',
	'application_owner',
	'specific_user'
] as const;

export const GET: RequestHandler = async ({ params, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) error(401, 'Unauthorized');

	const result = await getTriggerRule(params.id, locals.accessToken, locals.tenantId, fetch);
	return json(result);
};

export const PUT: RequestHandler = async ({ params, request, locals, fetch }) => {
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
	const data: UpdateTriggerRuleRequest = {};
	if (body.name !== undefined) {
		if (typeof body.name !== 'string' || body.name.length === 0) {
			error(400, 'name must be a non-empty string');
		}
		data.name = body.name;
	}
	if (body.trigger_type !== undefined) {
		if (!TRIGGER_TYPES.includes(body.trigger_type as (typeof TRIGGER_TYPES)[number])) {
			error(400, 'trigger_type is required');
		}
		data.trigger_type = body.trigger_type as TriggerType;
	}
	if (body.scope_type !== undefined) {
		if (!SCOPE_TYPES.includes(body.scope_type as (typeof SCOPE_TYPES)[number])) {
			error(400, 'scope_type is required');
		}
		data.scope_type = body.scope_type as ScopeType;
	}
	if (body.scope_id !== undefined) {
		if (typeof body.scope_id !== 'string') {
			error(400, 'scope_id must be a string');
		}
		data.scope_id = body.scope_id;
	}
	if (body.reviewer_type !== undefined) {
		if (!REVIEWER_TYPES.includes(body.reviewer_type as (typeof REVIEWER_TYPES)[number])) {
			error(400, 'reviewer_type is required');
		}
		data.reviewer_type = body.reviewer_type as ReviewerType;
	}
	if (body.specific_reviewer_id !== undefined) {
		if (typeof body.specific_reviewer_id !== 'string') {
			error(400, 'specific_reviewer_id must be a string');
		}
		data.specific_reviewer_id = body.specific_reviewer_id;
	}
	if (body.fallback_reviewer_id !== undefined) {
		if (typeof body.fallback_reviewer_id !== 'string') {
			error(400, 'fallback_reviewer_id must be a string');
		}
		data.fallback_reviewer_id = body.fallback_reviewer_id;
	}
	if (body.timeout_secs !== undefined) {
		if (typeof body.timeout_secs !== 'number') {
			error(400, 'timeout_secs must be a number');
		}
		data.timeout_secs = body.timeout_secs;
	}
	if (body.reminder_threshold_percent !== undefined) {
		if (typeof body.reminder_threshold_percent !== 'number') {
			error(400, 'reminder_threshold_percent must be a number');
		}
		data.reminder_threshold_percent = body.reminder_threshold_percent;
	}
	if (body.auto_revoke !== undefined) {
		if (typeof body.auto_revoke !== 'boolean') {
			error(400, 'auto_revoke must be a boolean');
		}
		data.auto_revoke = body.auto_revoke;
	}
	if (body.revoke_triggering_assignment !== undefined) {
		if (typeof body.revoke_triggering_assignment !== 'boolean') {
			error(400, 'revoke_triggering_assignment must be a boolean');
		}
		data.revoke_triggering_assignment = body.revoke_triggering_assignment;
	}
	if (body.is_default !== undefined) {
		if (typeof body.is_default !== 'boolean') {
			error(400, 'is_default must be a boolean');
		}
		data.is_default = body.is_default;
	}
	if (body.priority !== undefined) {
		if (typeof body.priority !== 'number') {
			error(400, 'priority must be a number');
		}
		data.priority = body.priority;
	}
	if (body.metadata !== undefined) {
		if (!body.metadata || typeof body.metadata !== 'object' || Array.isArray(body.metadata)) {
			error(400, 'metadata must be an object');
		}
		data.metadata = body.metadata as Record<string, unknown>;
	}
	const result = await updateTriggerRule(
		params.id,
		data,
		locals.accessToken,
		locals.tenantId,
		fetch
	);
	return json(result);
};

export const DELETE: RequestHandler = async ({ params, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) error(401, 'Unauthorized');

	await deleteTriggerRule(params.id, locals.accessToken, locals.tenantId, fetch);
	return new Response(null, { status: 204 });
};
