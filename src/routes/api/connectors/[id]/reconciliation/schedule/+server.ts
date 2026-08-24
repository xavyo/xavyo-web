import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getSchedule, upsertSchedule, deleteSchedule } from '$lib/api/reconciliation';
import type {
	ReconciliationMode,
	ReconciliationScheduleFrequency,
	UpsertScheduleRequest
} from '$lib/api/types';

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
	if (typeof body.hour_of_day !== 'number') {
		error(400, 'hour_of_day is required');
	}
	if (typeof body.enabled !== 'boolean') {
		error(400, 'enabled is required');
	}
	const data: UpsertScheduleRequest = {
		mode: body.mode as ReconciliationMode,
		frequency: body.frequency as ReconciliationScheduleFrequency,
		hour_of_day: body.hour_of_day,
		enabled: body.enabled
	};
	if (body.day_of_week !== undefined) {
		if (typeof body.day_of_week !== 'number') {
			error(400, 'day_of_week must be a number');
		}
		data.day_of_week = body.day_of_week;
	}
	if (body.day_of_month !== undefined) {
		if (typeof body.day_of_month !== 'number') {
			error(400, 'day_of_month must be a number');
		}
		data.day_of_month = body.day_of_month;
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
