import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { hasAdminRole } from '$lib/server/auth';
import { listSiemExports, createSiemExport } from '$lib/api/siem';
import { ApiError } from '$lib/api/client';
import { listPagination } from '$lib/server/list-pagination';
import type { CreateSiemExportRequest, EventCategory } from '$lib/api/types';

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
		const params: Record<string, string | number> = {};
		const status = url.searchParams.get('status');
		const output_format = url.searchParams.get('output_format');
		const { limit, offset } = listPagination(url);

		if (status) params.status = status;
		if (output_format) params.output_format = output_format;
		if (limit != null) params.limit = limit;
		if (offset != null) params.offset = offset;

		const result = await listSiemExports(params, locals.accessToken, locals.tenantId, fetch);
		return json(result);
	} catch (e) {
		if (e instanceof ApiError) {
			return json({ error: e.message }, { status: e.status });
		}
		return json({ error: 'Failed to list SIEM exports' }, { status: 500 });
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
		if (typeof body.date_range_start !== 'string' || body.date_range_start.length === 0) {
			return json({ error: 'date_range_start is required' }, { status: 400 });
		}
		if (typeof body.date_range_end !== 'string' || body.date_range_end.length === 0) {
			return json({ error: 'date_range_end is required' }, { status: 400 });
		}
		if (!EXPORT_FORMATS.includes(body.output_format as (typeof EXPORT_FORMATS)[number])) {
			return json({ error: 'output_format is required' }, { status: 400 });
		}
		const data: CreateSiemExportRequest = {
			date_range_start: body.date_range_start,
			date_range_end: body.date_range_end,
			output_format: body.output_format as CreateSiemExportRequest['output_format']
		};
		if (body.event_type_filter !== undefined) {
			if (
				!Array.isArray(body.event_type_filter) ||
				!body.event_type_filter.every((item) => EVENT_CATEGORIES.includes(item as EventCategory))
			) {
				return json({ error: 'event_type_filter must be an array of event categories' }, { status: 400 });
			}
			data.event_type_filter = body.event_type_filter as EventCategory[];
		}
		const result = await createSiemExport(data, locals.accessToken, locals.tenantId, fetch);
		return json(result, { status: 201 });
	} catch (e) {
		if (e instanceof ApiError) {
			return json({ error: e.message }, { status: e.status });
		}
		return json({ error: 'Failed to create SIEM export' }, { status: 500 });
	}
};
