import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getSlaPolicy, updateSlaPolicy, deleteSlaPolicy } from '$lib/api/governance-operations';
import type { UpdateSlaPolicyRequest } from '$lib/api/types';
import { ApiError } from '$lib/api/client';
import { hasAdminRole } from '$lib/server/auth';

export const GET: RequestHandler = async ({ params, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) {
		error(401, 'Unauthorized');
	}

	try {
		const result = await getSlaPolicy(params.id, locals.accessToken, locals.tenantId, fetch);
		return json(result);
	} catch (e) {
		if (e instanceof ApiError) error(e.status, e.message);
		throw e;
	}
};

export const PUT: RequestHandler = async ({ params, request, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) {
		error(401, 'Unauthorized');
	}

	try {
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
		const data: UpdateSlaPolicyRequest = {};
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
		if (body.target_duration_seconds !== undefined) {
			if (typeof body.target_duration_seconds !== 'number') {
				error(400, 'target_duration_seconds must be a number');
			}
			data.target_duration_seconds = body.target_duration_seconds;
		}
		if (body.warning_threshold_percent !== undefined) {
			if (typeof body.warning_threshold_percent !== 'number') {
				error(400, 'warning_threshold_percent must be a number');
			}
			data.warning_threshold_percent = body.warning_threshold_percent;
		}
		if (body.breach_notification_enabled !== undefined) {
			if (typeof body.breach_notification_enabled !== 'boolean') {
				error(400, 'breach_notification_enabled must be a boolean');
			}
			data.breach_notification_enabled = body.breach_notification_enabled;
		}
		if (body.escalation_contacts !== undefined) {
			data.escalation_contacts = body.escalation_contacts;
		}
		if (body.is_active !== undefined) {
			if (typeof body.is_active !== 'boolean') {
				error(400, 'is_active must be a boolean');
			}
			data.is_active = body.is_active;
		}
		const result = await updateSlaPolicy(
			params.id,
			data,
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

export const DELETE: RequestHandler = async ({ params, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) {
		error(401, 'Unauthorized');
	}
	if (!hasAdminRole(locals.user?.roles)) {
		error(403, 'Forbidden');
	}

	try {
		await deleteSlaPolicy(params.id, locals.accessToken, locals.tenantId, fetch);
		return new Response(null, { status: 204 });
	} catch (e) {
		if (e instanceof ApiError) error(e.status, e.message);
		throw e;
	}
};
