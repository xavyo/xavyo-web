import type { Actions, PageServerLoad } from './$types';
import { error, fail } from '@sveltejs/kit';
import {
	getSchedule,
	upsertSchedule,
	deleteSchedule,
	enableSchedule,
	disableSchedule
} from '$lib/api/reconciliation';
import { ApiError } from '$lib/api/client';
import { isJsonParseError } from '$lib/utils/json-record';
import { parseBoundedInteger, parseOptionalBoundedInteger } from '$lib/server/list-pagination';

export const load: PageServerLoad = async ({ params, locals, fetch }) => {

	try {
		const schedule = await getSchedule(params.id, locals.accessToken!, locals.tenantId!, fetch);
		return { schedule, connectorId: params.id };
	} catch (e) {
		if (e instanceof ApiError && e.status === 404) {
			return { schedule: null, connectorId: params.id };
		}
		if (e instanceof ApiError) error(e.status, e.message);
		error(500, 'Failed to load reconciliation schedule');
	}
};

export const actions: Actions = {
	save: async ({ params, request, locals, fetch }) => {
		const fd = await request.formData();
		const mode = fd.get('mode') as string;
		const frequency = fd.get('frequency') as string;
		const enabled = fd.get('enabled') === 'on';
		const cronRaw = fd.get('cron_expression');
		const cron_expression =
			typeof cronRaw === 'string' && cronRaw.trim().length > 0 ? cronRaw.trim() : undefined;

		try {
			if (frequency === 'cron' && !cron_expression) {
				return fail(400, { error: 'cron_expression is required' });
			}
			const day_of_week = parseOptionalBoundedInteger(fd.get('day_of_week'), 0, 6, 'day_of_week');
			const day_of_month = parseOptionalBoundedInteger(
				fd.get('day_of_month'),
				1,
				31,
				'day_of_month'
			);
			const hour_of_day = parseBoundedInteger(fd.get('hour_of_day'), 0, 23, 'hour_of_day', 0);

			await upsertSchedule(
				params.id,
				{
					mode: mode as 'full' | 'delta',
					frequency: frequency as 'hourly' | 'daily' | 'weekly' | 'monthly' | 'cron',
					cron_expression,
					day_of_week,
					day_of_month,
					hour_of_day,
					enabled
				},
				locals.accessToken!,
				locals.tenantId!,
				fetch
			);
			return { success: true, action: 'saved' };
		} catch (e) {
			if (isJsonParseError(e)) {
				return fail(400, { error: e instanceof Error ? e.message : 'Invalid schedule fields' });
			}
			if (e instanceof ApiError) return fail(e.status, { error: e.message });
			return fail(500, { error: 'An unexpected error occurred' });
		}
	},

	delete: async ({ params, locals, fetch }) => {
		try {
			await deleteSchedule(params.id, locals.accessToken!, locals.tenantId!, fetch);
			return { success: true, action: 'deleted' };
		} catch (e) {
			if (e instanceof ApiError) return fail(e.status, { error: e.message });
			return fail(500, { error: 'An unexpected error occurred' });
		}
	},

	enable: async ({ params, locals, fetch }) => {
		try {
			await enableSchedule(params.id, locals.accessToken!, locals.tenantId!, fetch);
			return { success: true, action: 'enabled' };
		} catch (e) {
			if (e instanceof ApiError) return fail(e.status, { error: e.message });
			return fail(500, { error: 'An unexpected error occurred' });
		}
	},

	disable: async ({ params, locals, fetch }) => {
		try {
			await disableSchedule(params.id, locals.accessToken!, locals.tenantId!, fetch);
			return { success: true, action: 'disabled' };
		} catch (e) {
			if (e instanceof ApiError) return fail(e.status, { error: e.message });
			return fail(500, { error: 'An unexpected error occurred' });
		}
	}
};
