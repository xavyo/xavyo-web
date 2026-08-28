import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { hasAdminRole } from '$lib/server/auth';
import {
	getReclamationRule,
	updateReclamationRule,
	deleteReclamationRule
} from '$lib/api/licenses';
import type { UpdateReclamationRuleRequest } from '$lib/api/types';
import { ApiError } from '$lib/api/client';

export const GET: RequestHandler = async ({ params, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) {
		error(401, 'Unauthorized');
	}

	try {
		const result = await getReclamationRule(
			params.id,
			locals.accessToken,
			locals.tenantId,
			fetch
		);
		return json(result);
	} catch (e) {
		if (e instanceof ApiError) {
			return json({ error: e.message }, { status: e.status });
		}
		return json({ error: 'Failed to get reclamation rule' }, { status: 500 });
	}
};

export const PUT: RequestHandler = async ({ params, request, locals, fetch }) => {
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
	const data: UpdateReclamationRuleRequest = {};
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
	if (body.enabled !== undefined) {
		if (typeof body.enabled !== 'boolean') {
			return json({ error: 'enabled must be a boolean' }, { status: 400 });
		}
		data.enabled = body.enabled;
	}
	try {
		const result = await updateReclamationRule(
			params.id,
			data,
			locals.accessToken,
			locals.tenantId,
			fetch
		);
		return json(result);
	} catch (e) {
		if (e instanceof ApiError) {
			return json({ error: e.message }, { status: e.status });
		}
		return json({ error: 'Failed to update reclamation rule' }, { status: 500 });
	}
};

export const DELETE: RequestHandler = async ({ params, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) {
		error(401, 'Unauthorized');
	}
	if (!hasAdminRole(locals.user?.roles)) {
		error(403, 'Forbidden');
	}

	try {
		await deleteReclamationRule(params.id, locals.accessToken, locals.tenantId, fetch);
		return new Response(null, { status: 204 });
	} catch (e) {
		if (e instanceof ApiError) {
			return json({ error: e.message }, { status: e.status });
		}
		return json({ error: 'Failed to delete reclamation rule' }, { status: 500 });
	}
};
