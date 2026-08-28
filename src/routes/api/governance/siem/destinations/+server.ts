import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { hasAdminRole } from '$lib/server/auth';
import { listSiemDestinations, createSiemDestination } from '$lib/api/siem';
import { ApiError } from '$lib/api/client';
import { listPagination } from '$lib/server/list-pagination';
import type { CreateSiemDestinationRequest, EventCategory } from '$lib/api/types';

const DESTINATION_TYPES = ['syslog_tcp_tls', 'syslog_udp', 'webhook', 'splunk_hec'] as const;
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

export const GET: RequestHandler = async ({ url, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) {
		error(401, 'Unauthorized');
	}
	if (!hasAdminRole(locals.user?.roles)) {
		error(403, 'Forbidden');
	}

	try {
		const params: Record<string, string | number | boolean> = {};
		const enabled = url.searchParams.get('enabled');
		const destination_type = url.searchParams.get('destination_type');
		const { limit, offset } = listPagination(url);

		if (enabled) params.enabled = enabled === 'true';
		if (destination_type) params.destination_type = destination_type;
		if (limit != null) params.limit = limit;
		if (offset != null) params.offset = offset;

		const result = await listSiemDestinations(params, locals.accessToken, locals.tenantId, fetch);
		return json(result);
	} catch (e) {
		if (e instanceof ApiError) {
			return json({ error: e.message }, { status: e.status });
		}
		return json({ error: 'Failed to list SIEM destinations' }, { status: 500 });
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
			return json({ error: 'Invalid JSON body' }, { status: 400 });
		}
		if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
			return json({ error: 'Invalid JSON body' }, { status: 400 });
		}
		const body = parsed as Record<string, unknown>;
		if (typeof body.name !== 'string' || body.name.length === 0) {
			return json({ error: 'name is required' }, { status: 400 });
		}
		if (!DESTINATION_TYPES.includes(body.destination_type as (typeof DESTINATION_TYPES)[number])) {
			return json({ error: 'destination_type is required' }, { status: 400 });
		}
		if (typeof body.endpoint_host !== 'string' || body.endpoint_host.length === 0) {
			return json({ error: 'endpoint_host is required' }, { status: 400 });
		}
		if (!EXPORT_FORMATS.includes(body.export_format as (typeof EXPORT_FORMATS)[number])) {
			return json({ error: 'export_format is required' }, { status: 400 });
		}
		const data: CreateSiemDestinationRequest = {
			name: body.name,
			destination_type: body.destination_type as CreateSiemDestinationRequest['destination_type'],
			endpoint_host: body.endpoint_host,
			export_format: body.export_format as CreateSiemDestinationRequest['export_format']
		};
		if (body.endpoint_port !== undefined) {
			if (typeof body.endpoint_port !== 'number') {
				return json({ error: 'endpoint_port must be a number' }, { status: 400 });
			}
			data.endpoint_port = body.endpoint_port;
		}
		if (body.auth_config_b64 !== undefined) {
			if (typeof body.auth_config_b64 !== 'string') {
				return json({ error: 'auth_config_b64 must be a string' }, { status: 400 });
			}
			data.auth_config_b64 = body.auth_config_b64;
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
		const result = await createSiemDestination(data, locals.accessToken, locals.tenantId, fetch);
		return json(result, { status: 201 });
	} catch (e) {
		if (e instanceof ApiError) {
			return json({ error: e.message }, { status: e.status });
		}
		return json({ error: 'Failed to create SIEM destination' }, { status: 500 });
	}
};
