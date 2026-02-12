import type { Actions, PageServerLoad } from './$types';
import { fail, redirect } from '@sveltejs/kit';
import { hasAdminRole } from '$lib/server/auth';
import {
	getSchedule,
	upsertSchedule,
	deleteSchedule,
	enableSchedule,
	disableSchedule
} from '$lib/api/reconciliation';
import { ApiError } from '$lib/api/client';

export const load: PageServerLoad = async ({ params, locals, fetch }) => {
	if (!hasAdminRole(locals.user?.roles)) redirect(302, '/dashboard');

	try {
		const schedule = await getSchedule(params.id, locals.accessToken!, locals.tenantId!, fetch);
		return { schedule, connectorId: params.id };
	} catch {
		return { schedule: null, connectorId: params.id };
	}
};

export const actions: Actions = {
	save: async ({ params, request, locals, fetch }) => {
		const fd = await request.formData();
		const mode = fd.get('mode') as string;
		const frequency = fd.get('frequency') as string;
		const day_of_week = fd.get('day_of_week') ? Number(fd.get('day_of_week')) : undefined;
		const day_of_month = fd.get('day_of_month') ? Number(fd.get('day_of_month')) : undefined;
		const hour_of_day = Number(fd.get('hour_of_day') ?? '0');
		const enabled = fd.get('enabled') === 'on';

		try {
			await upsertSchedule(
				params.id,
				{
					mode: mode as 'full' | 'delta',
					frequency: frequency as 'hourly' | 'daily' | 'weekly' | 'monthly' | 'cron',
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
