import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import {
	getReclamationRule,
	updateReclamationRule,
	deleteReclamationRule
} from '$lib/api/licenses';
import type { UpdateReclamationRuleRequest } from '$lib/api/types';
import { ApiError } from '$lib/api/client';
import { JsonObjectError, parseBoundedInteger } from '$lib/utils/json-record';

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
		try {
			data.threshold_days = parseBoundedInteger(body.threshold_days, 1, 3650, 'threshold_days');
		} catch (e) {
			if (e instanceof JsonObjectError) {
				return json({ error: e.message }, { status: 400 });
			}
			throw e;
		}
	}
	if (body.lifecycle_state !== undefined) {
		if (typeof body.lifecycle_state !== 'string') {
			return json({ error: 'lifecycle_state must be a string' }, { status: 400 });
		}
		data.lifecycle_state = body.lifecycle_state;
	}
	if (body.notification_days_before !== undefined) {
		try {
			data.notification_days_before = parseBoundedInteger(
				body.notification_days_before,
				0,
				365,
				'notification_days_before'
			);
		} catch (e) {
			if (e instanceof JsonObjectError) {
				return json({ error: e.message }, { status: 400 });
			}
			throw e;
		}
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
