import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { listReclamationRules, createReclamationRule } from '$lib/api/licenses';
import type { CreateReclamationRuleRequest, LicenseReclamationTrigger } from '$lib/api/types';
import { ApiError } from '$lib/api/client';
import { listPagination } from '$lib/server/list-pagination';

const TRIGGER_TYPES = ['inactivity', 'lifecycle_state'] as const;

export const GET: RequestHandler = async ({ url, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) {
		error(401, 'Unauthorized');
	}

	try {
		const params: Record<string, string | number | boolean> = {};
		const license_pool_id = url.searchParams.get('license_pool_id');
		const trigger_type = url.searchParams.get('trigger_type');
		const enabled = url.searchParams.get('enabled');
		const { limit, offset } = listPagination(url);

		if (license_pool_id) params.license_pool_id = license_pool_id;
		if (trigger_type) params.trigger_type = trigger_type;
		if (enabled) params.enabled = enabled === 'true';
		if (limit != null) params.limit = limit;
		if (offset != null) params.offset = offset;

		const result = await listReclamationRules(params, locals.accessToken, locals.tenantId, fetch);
		return json(result);
	} catch (e) {
		if (e instanceof ApiError) {
			return json({ error: e.message }, { status: e.status });
		}
		return json({ error: 'Failed to list reclamation rules' }, { status: 500 });
	}
};

export const POST: RequestHandler = async ({ request, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) {
		error(401, 'Unauthorized');
	}

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
	if (typeof body.license_pool_id !== 'string' || body.license_pool_id.length === 0) {
		return json({ error: 'license_pool_id is required' }, { status: 400 });
	}
	if (!TRIGGER_TYPES.includes(body.trigger_type as (typeof TRIGGER_TYPES)[number])) {
		return json({ error: 'trigger_type is required' }, { status: 400 });
	}
	const data: CreateReclamationRuleRequest = {
		license_pool_id: body.license_pool_id,
		trigger_type: body.trigger_type as LicenseReclamationTrigger
	};
	if (body.threshold_days !== undefined) {
		if (typeof body.threshold_days !== 'number') {
			return json({ error: 'threshold_days must be a number' }, { status: 400 });
		}
		data.threshold_days = body.threshold_days;
	}
	if (body.lifecycle_state !== undefined) {
		if (typeof body.lifecycle_state !== 'string') {
			return json({ error: 'lifecycle_state must be a string' }, { status: 400 });
		}
		data.lifecycle_state = body.lifecycle_state;
	}
	if (body.notification_days_before !== undefined) {
		if (typeof body.notification_days_before !== 'number') {
			return json({ error: 'notification_days_before must be a number' }, { status: 400 });
		}
		data.notification_days_before = body.notification_days_before;
	}
	try {
		const result = await createReclamationRule(data, locals.accessToken, locals.tenantId, fetch);
		return json(result, { status: 201 });
	} catch (e) {
		if (e instanceof ApiError) {
			return json({ error: e.message }, { status: e.status });
		}
		return json({ error: 'Failed to create reclamation rule' }, { status: 500 });
	}
};
