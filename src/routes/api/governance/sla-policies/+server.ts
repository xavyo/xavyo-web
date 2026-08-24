import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { listSlaPolicies, createSlaPolicy } from '$lib/api/governance-operations';
import type { CreateSlaPolicyRequest } from '$lib/api/types';
import { ApiError } from '$lib/api/client';
import { hasAdminRole } from '$lib/server/auth';

export const GET: RequestHandler = async ({ url, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) {
		error(401, 'Unauthorized');
	}
	if (!hasAdminRole(locals.user?.roles)) {
		error(403, 'Forbidden');
	}

	try {
		const result = await listSlaPolicies(
			{
				limit: url.searchParams.has('limit') ? Number(url.searchParams.get('limit')) : undefined,
				offset: url.searchParams.has('offset') ? Number(url.searchParams.get('offset')) : undefined
			},
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
	if (!locals.accessToken || !locals.tenantId) {
		error(401, 'Unauthorized');
	}
	if (!hasAdminRole(locals.user?.roles)) {
		error(403, 'Forbidden');
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
		if (typeof body.name !== 'string' || body.name.length === 0) {
			error(400, 'name is required');
		}
		if (typeof body.target_duration_seconds !== 'number') {
			error(400, 'target_duration_seconds is required');
		}
		const data: CreateSlaPolicyRequest = {
			name: body.name,
			target_duration_seconds: body.target_duration_seconds,
			warning_threshold_percent:
				typeof body.warning_threshold_percent === 'number' ? body.warning_threshold_percent : 75,
			breach_notification_enabled:
				typeof body.breach_notification_enabled === 'boolean'
					? body.breach_notification_enabled
					: true
		};
		if (body.description !== undefined) {
			if (typeof body.description !== 'string') {
				error(400, 'description must be a string');
			}
			data.description = body.description;
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
		const result = await createSlaPolicy(data, locals.accessToken, locals.tenantId, fetch);
		return json(result, { status: 201 });
	} catch (e) {
		if (e instanceof ApiError) error(e.status, e.message);
		throw e;
	}
};
