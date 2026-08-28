import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { listSchedules, createSchedule } from '$lib/api/governance-reporting';
import type {
	CreateReportScheduleRequest,
	OutputFormat,
	ScheduleFrequency
} from '$lib/api/types';
import { ApiError } from '$lib/api/client';
import { hasAdminRole } from '$lib/server/auth';
import { listPagination } from '$lib/server/list-pagination';

const SCHEDULE_FREQUENCIES = ['daily', 'weekly', 'monthly'] as const;
const OUTPUT_FORMATS = ['json', 'csv'] as const;

export const GET: RequestHandler = async ({ url, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) error(401, 'Unauthorized');

	try {
		const result = await listSchedules(
			{
				template_id: url.searchParams.get('template_id') ?? undefined,
				status: url.searchParams.get('status') ?? undefined,
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
	if (!locals.accessToken || !locals.tenantId) error(401, 'Unauthorized');
	if (!hasAdminRole(locals.user?.roles)) error(403, 'Forbidden');

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
	if (typeof body.template_id !== 'string' || body.template_id.length === 0) {
		error(400, 'template_id is required');
	}
	if (typeof body.name !== 'string' || body.name.length === 0) {
		error(400, 'name is required');
	}
	if (!SCHEDULE_FREQUENCIES.includes(body.frequency as (typeof SCHEDULE_FREQUENCIES)[number])) {
		error(400, 'frequency is required');
	}
	if (typeof body.schedule_hour !== 'number') {
		error(400, 'schedule_hour is required');
	}
	if (
		!Array.isArray(body.recipients) ||
		body.recipients.length === 0 ||
		body.recipients.some((item) => typeof item !== 'string' || item.length === 0)
	) {
		error(400, 'recipients is required');
	}
	if (!OUTPUT_FORMATS.includes(body.output_format as (typeof OUTPUT_FORMATS)[number])) {
		error(400, 'output_format is required');
	}
	const data: CreateReportScheduleRequest = {
		template_id: body.template_id,
		name: body.name,
		frequency: body.frequency as ScheduleFrequency,
		schedule_hour: body.schedule_hour,
		recipients: body.recipients as string[],
		output_format: body.output_format as OutputFormat
	};
	if (body.schedule_day_of_week !== undefined) {
		if (typeof body.schedule_day_of_week !== 'number') {
			error(400, 'schedule_day_of_week must be a number');
		}
		data.schedule_day_of_week = body.schedule_day_of_week;
	}
	if (body.schedule_day_of_month !== undefined) {
		if (typeof body.schedule_day_of_month !== 'number') {
			error(400, 'schedule_day_of_month must be a number');
		}
		data.schedule_day_of_month = body.schedule_day_of_month;
	}
	if (body.parameters !== undefined) {
		if (!body.parameters || typeof body.parameters !== 'object' || Array.isArray(body.parameters)) {
			error(400, 'parameters must be an object');
		}
		data.parameters = body.parameters as Record<string, unknown>;
	}
	try {
		const result = await createSchedule(data, locals.accessToken, locals.tenantId, fetch);
		return json(result, { status: 201 });
	} catch (e) {
		if (e instanceof ApiError) error(e.status, e.message);
		throw e;
	}
};
