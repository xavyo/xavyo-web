import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getSchedule, upsertSchedule, deleteSchedule } from '$lib/api/reconciliation';
import type {
	ReconciliationMode,
	ReconciliationScheduleFrequency,
	UpsertScheduleRequest
} from '$lib/api/types';
import { JsonObjectError, parseBoundedInteger } from '$lib/utils/json-record';

const MODES = ['full', 'delta'] as const;
const FREQUENCIES = ['hourly', 'daily', 'weekly', 'monthly', 'cron'] as const;

export const GET: RequestHandler = async ({ params, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) {
		error(401, 'Unauthorized');
	}

	const result = await getSchedule(params.id, locals.accessToken, locals.tenantId, fetch);

	return json(result);
};

export const PUT: RequestHandler = async ({ params, request, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) {
		error(401, 'Unauthorized');
	}

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
	if (!MODES.includes(body.mode as (typeof MODES)[number])) {
		error(400, 'mode is required');
	}
	if (!FREQUENCIES.includes(body.frequency as (typeof FREQUENCIES)[number])) {
		error(400, 'frequency is required');
	}
	let hour_of_day: number;
	try {
		hour_of_day = parseBoundedInteger(body.hour_of_day, 0, 23, 'hour_of_day');
	} catch (e) {
		if (e instanceof JsonObjectError) error(400, e.message);
		throw e;
	}
	if (typeof body.enabled !== 'boolean') {
		error(400, 'enabled is required');
	}
	const data: UpsertScheduleRequest = {
		mode: body.mode as ReconciliationMode,
		frequency: body.frequency as ReconciliationScheduleFrequency,
		hour_of_day,
		enabled: body.enabled
	};
	if (body.frequency === 'cron') {
		if (typeof body.cron_expression !== 'string' || body.cron_expression.trim().length === 0) {
			error(400, 'cron_expression is required');
		}
		data.cron_expression = body.cron_expression;
	} else if (body.cron_expression !== undefined) {
		if (body.cron_expression !== null && typeof body.cron_expression !== 'string') {
			error(400, 'cron_expression must be a string');
		}
		data.cron_expression = body.cron_expression as string | null;
	}
	if (body.day_of_week !== undefined) {
		try {
			data.day_of_week = parseBoundedInteger(body.day_of_week, 0, 6, 'day_of_week');
		} catch (e) {
			if (e instanceof JsonObjectError) error(400, e.message);
			throw e;
		}
	}
	if (body.day_of_month !== undefined) {
		try {
			data.day_of_month = parseBoundedInteger(body.day_of_month, 1, 31, 'day_of_month');
		} catch (e) {
			if (e instanceof JsonObjectError) error(400, e.message);
			throw e;
		}
	}
	const result = await upsertSchedule(
		params.id,
		data,
		locals.accessToken,
		locals.tenantId,
		fetch
	);

	return json(result);
};

export const DELETE: RequestHandler = async ({ params, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) {
		error(401, 'Unauthorized');
	}

	await deleteSchedule(params.id, locals.accessToken, locals.tenantId, fetch);

	return new Response(null, { status: 204 });
};
