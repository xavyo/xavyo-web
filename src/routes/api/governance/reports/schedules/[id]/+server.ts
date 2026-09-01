import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getSchedule, updateSchedule, deleteSchedule } from '$lib/api/governance-reporting';
import type {
	OutputFormat,
	ScheduleFrequency,
	UpdateReportScheduleRequest
} from '$lib/api/types';
import { ApiError } from '$lib/api/client';
import { JsonObjectError, parseBoundedInteger } from '$lib/utils/json-record';

const SCHEDULE_FREQUENCIES = ['daily', 'weekly', 'monthly'] as const;
const OUTPUT_FORMATS = ['json', 'csv'] as const;

export const GET: RequestHandler = async ({ params, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) error(401, 'Unauthorized');

	try {
		const result = await getSchedule(params.id, locals.accessToken, locals.tenantId, fetch);
		return json(result);
	} catch (e) {
		if (e instanceof ApiError) error(e.status, e.message);
		throw e;
	}
};

export const PUT: RequestHandler = async ({ params, request, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) error(401, 'Unauthorized');

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
	const data: UpdateReportScheduleRequest = {};
	if (body.name !== undefined) {
		if (typeof body.name !== 'string' || body.name.length === 0) {
			error(400, 'name must be a non-empty string');
		}
		data.name = body.name;
	}
	if (body.frequency !== undefined) {
		if (!SCHEDULE_FREQUENCIES.includes(body.frequency as (typeof SCHEDULE_FREQUENCIES)[number])) {
			error(400, 'frequency is required');
		}
		data.frequency = body.frequency as ScheduleFrequency;
	}
	try {
		if (body.schedule_hour !== undefined) {
			data.schedule_hour = parseBoundedInteger(body.schedule_hour, 0, 23, 'schedule_hour');
		}
		if (body.schedule_day_of_week !== undefined) {
			data.schedule_day_of_week =
				body.schedule_day_of_week === null
					? null
					: parseBoundedInteger(body.schedule_day_of_week, 0, 6, 'schedule_day_of_week');
		}
		if (body.schedule_day_of_month !== undefined) {
			data.schedule_day_of_month =
				body.schedule_day_of_month === null
					? null
					: parseBoundedInteger(body.schedule_day_of_month, 1, 31, 'schedule_day_of_month');
		}
	} catch (e) {
		if (e instanceof JsonObjectError) error(400, e.message);
		throw e;
	}
	if (body.recipients !== undefined) {
		if (
			!Array.isArray(body.recipients) ||
			body.recipients.some((item) => typeof item !== 'string')
		) {
			error(400, 'recipients must be an array of strings');
		}
		data.recipients = body.recipients as string[];
	}
	if (body.output_format !== undefined) {
		if (!OUTPUT_FORMATS.includes(body.output_format as (typeof OUTPUT_FORMATS)[number])) {
			error(400, 'output_format is required');
		}
		data.output_format = body.output_format as OutputFormat;
	}
	if (body.parameters !== undefined) {
		if (!body.parameters || typeof body.parameters !== 'object' || Array.isArray(body.parameters)) {
			error(400, 'parameters must be an object');
		}
		data.parameters = body.parameters as Record<string, unknown>;
	}
	try {
		const result = await updateSchedule(params.id, data, locals.accessToken, locals.tenantId, fetch);
		return json(result);
	} catch (e) {
		if (e instanceof ApiError) error(e.status, e.message);
		throw e;
	}
};

export const DELETE: RequestHandler = async ({ params, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) error(401, 'Unauthorized');

	try {
		await deleteSchedule(params.id, locals.accessToken, locals.tenantId, fetch);
		return new Response(null, { status: 204 });
	} catch (e) {
		if (e instanceof ApiError) error(e.status, e.message);
		throw e;
	}
};
