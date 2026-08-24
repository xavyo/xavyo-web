import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { hasAdminRole } from '$lib/server/auth';
import { getSiemDestination, updateSiemDestination, deleteSiemDestination } from '$lib/api/siem';
import { ApiError } from '$lib/api/client';
import type { EventCategory, UpdateSiemDestinationRequest } from '$lib/api/types';

const EXPORT_FORMATS = ['cef', 'syslog_rfc5424', 'json', 'csv'] as const;
const EVENT_CATEGORIES: EventCategory[] = [
	'authentication',
	'user_lifecycle',
	'group_changes',
	'access_requests',
	'provisioning',
	'administrative',
	'security',
	'entitlement',
	'sod_violation'
];

export const GET: RequestHandler = async ({ params, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) {
		error(401, 'Unauthorized');
	}
	if (!hasAdminRole(locals.user?.roles)) {
		error(403, 'Forbidden');
	}

	try {
		const result = await getSiemDestination(params.id, locals.accessToken, locals.tenantId, fetch);
		return json(result);
	} catch (e) {
		if (e instanceof ApiError) {
			return json({ error: e.message }, { status: e.status });
		}
		return json({ error: 'Failed to get SIEM destination' }, { status: 500 });
	}
};

export const PUT: RequestHandler = async ({ params, request, locals, fetch }) => {
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
			return json({ error: 'Invalid JSON body' }, { status: 400 });
		}
		if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
			return json({ error: 'Invalid JSON body' }, { status: 400 });
		}
		const body = parsed as Record<string, unknown>;
		const data: UpdateSiemDestinationRequest = {};
		if (body.name !== undefined) {
			if (typeof body.name !== 'string' || body.name.length === 0) {
				return json({ error: 'name must be a non-empty string' }, { status: 400 });
			}
			data.name = body.name;
		}
		if (body.endpoint_host !== undefined) {
			if (typeof body.endpoint_host !== 'string' || body.endpoint_host.length === 0) {
				return json({ error: 'endpoint_host must be a non-empty string' }, { status: 400 });
			}
			data.endpoint_host = body.endpoint_host;
		}
		if (body.endpoint_port !== undefined) {
			if (typeof body.endpoint_port !== 'number') {
				return json({ error: 'endpoint_port must be a number' }, { status: 400 });
			}
			data.endpoint_port = body.endpoint_port;
		}
		if (body.export_format !== undefined) {
			if (!EXPORT_FORMATS.includes(body.export_format as (typeof EXPORT_FORMATS)[number])) {
				return json({ error: 'export_format is invalid' }, { status: 400 });
			}
			data.export_format = body.export_format as UpdateSiemDestinationRequest['export_format'];
		}
		if (body.event_type_filter !== undefined) {
			if (
				!Array.isArray(body.event_type_filter) ||
				!body.event_type_filter.every((item) => EVENT_CATEGORIES.includes(item as EventCategory))
			) {
				return json({ error: 'event_type_filter must be an array of event categories' }, { status: 400 });
			}
			data.event_type_filter = body.event_type_filter as EventCategory[];
		}
		if (body.enabled !== undefined) {
			if (typeof body.enabled !== 'boolean') {
				return json({ error: 'enabled must be a boolean' }, { status: 400 });
			}
			data.enabled = body.enabled;
		}
		const result = await updateSiemDestination(
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
		return json({ error: 'Failed to update SIEM destination' }, { status: 500 });
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
		await deleteSiemDestination(params.id, locals.accessToken, locals.tenantId, fetch);
		return new Response(null, { status: 204 });
	} catch (e) {
		if (e instanceof ApiError) {
			return json({ error: e.message }, { status: e.status });
		}
		return json({ error: 'Failed to delete SIEM destination' }, { status: 500 });
	}
};
