import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { listTriggerRules, createTriggerRule } from '$lib/api/micro-certifications';
import { listPagination } from '$lib/server/list-pagination';
import type { CreateTriggerRuleRequest, ReviewerType, ScopeType, TriggerType } from '$lib/api/types';
import { JsonObjectError, parseBoundedInteger } from '$lib/utils/json-record';

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

export const GET: RequestHandler = async ({ url, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) error(401, 'Unauthorized');

	const trigger_type = url.searchParams.get('trigger_type') ?? undefined;
	const scope_type = url.searchParams.get('scope_type') ?? undefined;
	const is_active =
		url.searchParams.get('is_active') !== null
			? url.searchParams.get('is_active') === 'true'
			: undefined;

	const result = await listTriggerRules(
		{ trigger_type, scope_type, is_active, ...listPagination(url) },
		locals.accessToken,
		locals.tenantId,
		fetch
	);
	return json(result);
};

export const POST: RequestHandler = async ({ request, locals, fetch }) => {
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
	if (typeof body.name !== 'string' || body.name.length === 0) {
		error(400, 'name is required');
	}
	if (!TRIGGER_TYPES.includes(body.trigger_type as (typeof TRIGGER_TYPES)[number])) {
		error(400, 'trigger_type is required');
	}
	if (!SCOPE_TYPES.includes(body.scope_type as (typeof SCOPE_TYPES)[number])) {
		error(400, 'scope_type is required');
	}
	if (!REVIEWER_TYPES.includes(body.reviewer_type as (typeof REVIEWER_TYPES)[number])) {
		error(400, 'reviewer_type is required');
	}
	const data: CreateTriggerRuleRequest = {
		name: body.name,
		trigger_type: body.trigger_type as TriggerType,
		scope_type: body.scope_type as ScopeType,
		reviewer_type: body.reviewer_type as ReviewerType
	};
	if (body.scope_id !== undefined) {
		if (typeof body.scope_id !== 'string') {
			error(400, 'scope_id must be a string');
		}
		data.scope_id = body.scope_id;
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
	try {
		if (body.timeout_secs !== undefined) {
			data.timeout_secs = parseBoundedInteger(body.timeout_secs, 0, 31_536_000, 'timeout_secs');
		}
		if (body.reminder_threshold_percent !== undefined) {
			data.reminder_threshold_percent = parseBoundedInteger(
				body.reminder_threshold_percent,
				0,
				100,
				'reminder_threshold_percent'
			);
		}
		if (body.priority !== undefined) {
			data.priority = parseBoundedInteger(body.priority, 0, 1_000_000, 'priority');
		}
	} catch (e) {
		if (e instanceof JsonObjectError) error(400, e.message);
		throw e;
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
	if (body.metadata !== undefined) {
		if (!body.metadata || typeof body.metadata !== 'object' || Array.isArray(body.metadata)) {
			error(400, 'metadata must be an object');
		}
		data.metadata = body.metadata as Record<string, unknown>;
	}
	try {
		const result = await createTriggerRule(data, locals.accessToken, locals.tenantId, fetch);
		return json(result, { status: 201 });
	} catch (e: any) {
		const msg = e?.message || e?.body?.message || String(e);
		const status = e?.status || 500;
		return json({ error: msg, detail: e?.body }, { status });
	}
};
