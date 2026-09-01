import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { listSlaPolicies, createSlaPolicy } from '$lib/api/governance-operations';
import type { CreateSlaPolicyRequest } from '$lib/api/types';
import { ApiError } from '$lib/api/client';
import { listPagination } from '$lib/server/list-pagination';
import { JsonObjectError, parseBoundedInteger } from '$lib/utils/json-record';

export const GET: RequestHandler = async ({ url, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) {
		error(401, 'Unauthorized');
	}

	try {
		const status = url.searchParams.get('status');
		const isActiveParam = url.searchParams.get('is_active');
		const is_active =
			isActiveParam === 'true' ? true : isActiveParam === 'false' ? false : status === 'active' ? true : status === 'inactive' ? false : undefined;
		const result = await listSlaPolicies(
			{
				is_active,
				...listPagination(url)
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
		let targetDuration: number;
		let warningPercent: number;
		try {
			targetDuration = parseBoundedInteger(
				body.target_duration_seconds,
				60,
				604800,
				'target_duration_seconds'
			);
			warningPercent =
				body.warning_threshold_percent === undefined
					? 75
					: parseBoundedInteger(body.warning_threshold_percent, 1, 100, 'warning_threshold_percent');
		} catch (e) {
			if (e instanceof JsonObjectError) error(400, e.message);
			throw e;
		}
		const data: CreateSlaPolicyRequest = {
			name: body.name,
			target_duration_seconds: targetDuration,
			warning_threshold_percent: warningPercent,
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
