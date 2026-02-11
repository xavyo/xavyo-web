import type { PageServerLoad, Actions } from './$types';
import { redirect, error } from '@sveltejs/kit';
import { superValidate, message } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { updateScheduleSchema } from '$lib/schemas/governance-reporting';
import {
	getSchedule,
	updateSchedule,
	deleteSchedule,
	pauseSchedule,
	resumeSchedule
} from '$lib/api/governance-reporting';
import { ApiError } from '$lib/api/client';
import { hasAdminRole } from '$lib/server/auth';
import type { ErrorStatus } from 'sveltekit-superforms';

export const load: PageServerLoad = async ({ params, locals, fetch }) => {
	if (!hasAdminRole(locals.user?.roles)) {
		redirect(302, '/dashboard');
	}
	if (!locals.accessToken || !locals.tenantId) {
		error(401, 'Unauthorized');
	}

	try {
		const schedule = await getSchedule(params.id, locals.accessToken, locals.tenantId, fetch);
		const editForm = await superValidate(
			{
				name: schedule.name,
				frequency: schedule.frequency as 'daily' | 'weekly' | 'monthly',
				schedule_hour: schedule.schedule_hour,
				schedule_day_of_week: schedule.schedule_day_of_week,
				schedule_day_of_month: schedule.schedule_day_of_month,
				recipients: schedule.recipients.join(', '),
				output_format: schedule.output_format as 'json' | 'csv'
			},
			zod(updateScheduleSchema)
		);
		return { schedule, editForm };
	} catch (e) {
		if (e instanceof ApiError) error(e.status, e.message);
		throw e;
	}
};

export const actions: Actions = {
	edit: async ({ params, request, locals, fetch }) => {
		if (!locals.accessToken || !locals.tenantId) error(401, 'Unauthorized');

		const form = await superValidate(request, zod(updateScheduleSchema));
		if (!form.valid) return message(form, 'Please fix the errors', { status: 400 as ErrorStatus });

		const body: Record<string, unknown> = {};
		if (form.data.name) body.name = form.data.name;
		if (form.data.frequency) body.frequency = form.data.frequency;
		if (form.data.schedule_hour !== undefined) body.schedule_hour = form.data.schedule_hour;
		if (form.data.schedule_day_of_week !== undefined)
			body.schedule_day_of_week = form.data.schedule_day_of_week;
		if (form.data.schedule_day_of_month !== undefined)
			body.schedule_day_of_month = form.data.schedule_day_of_month;
		if (form.data.recipients) {
			body.recipients = form.data.recipients
				.split(',')
				.map((r) => r.trim())
				.filter(Boolean);
		}
		if (form.data.output_format) body.output_format = form.data.output_format;

		try {
			await updateSchedule(
				params.id,
				body as Parameters<typeof updateSchedule>[1],
				locals.accessToken,
				locals.tenantId,
				fetch
			);
			redirect(303, `/governance/reports/schedules/${params.id}`);
		} catch (e) {
			if (e instanceof ApiError) return message(form, e.message, { status: e.status as ErrorStatus });
			throw e;
		}
	},
	pause: async ({ params, locals, fetch }) => {
		if (!locals.accessToken || !locals.tenantId) error(401, 'Unauthorized');

		try {
			await pauseSchedule(params.id, locals.accessToken, locals.tenantId, fetch);
			redirect(303, `/governance/reports/schedules/${params.id}`);
		} catch (e) {
			if (e instanceof ApiError) error(e.status, e.message);
			throw e;
		}
	},
	resume: async ({ params, locals, fetch }) => {
		if (!locals.accessToken || !locals.tenantId) error(401, 'Unauthorized');

		try {
			await resumeSchedule(params.id, locals.accessToken, locals.tenantId, fetch);
			redirect(303, `/governance/reports/schedules/${params.id}`);
		} catch (e) {
			if (e instanceof ApiError) error(e.status, e.message);
			throw e;
		}
	},
	delete: async ({ params, locals, fetch }) => {
		if (!locals.accessToken || !locals.tenantId) error(401, 'Unauthorized');

		try {
			await deleteSchedule(params.id, locals.accessToken, locals.tenantId, fetch);
			redirect(303, '/governance/reports');
		} catch (e) {
			if (e instanceof ApiError) error(e.status, e.message);
			throw e;
		}
	}
};
