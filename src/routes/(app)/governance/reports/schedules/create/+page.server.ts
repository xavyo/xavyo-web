import type { PageServerLoad, Actions } from './$types';
import { redirect, error } from '@sveltejs/kit';
import { superValidate, message } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { createScheduleSchema } from '$lib/schemas/governance-reporting';
import { createSchedule } from '$lib/api/governance-reporting';
import { ApiError } from '$lib/api/client';
import { hasAdminRole } from '$lib/server/auth';
import type { ErrorStatus } from 'sveltekit-superforms';

export const load: PageServerLoad = async ({ locals, url }) => {
	if (!hasAdminRole(locals.user?.roles)) {
		redirect(302, '/dashboard');
	}
	const templateId = url.searchParams.get('template_id') ?? undefined;
	const form = await superValidate(
		{ template_id: templateId, schedule_hour: 8, output_format: 'json' as const },
		zod(createScheduleSchema)
	);
	return { form };
};

export const actions: Actions = {
	default: async ({ request, locals, fetch }) => {
		if (!locals.accessToken || !locals.tenantId) {
			error(401, 'Unauthorized');
		}

		const form = await superValidate(request, zod(createScheduleSchema));
		if (!form.valid) return message(form, 'Please fix the errors', { status: 400 as ErrorStatus });

		const recipients = form.data.recipients
			.split(',')
			.map((r) => r.trim())
			.filter(Boolean);

		try {
			await createSchedule(
				{
					template_id: form.data.template_id,
					name: form.data.name,
					frequency: form.data.frequency,
					schedule_hour: form.data.schedule_hour,
					schedule_day_of_week: form.data.schedule_day_of_week,
					schedule_day_of_month: form.data.schedule_day_of_month,
					recipients,
					output_format: form.data.output_format
				},
				locals.accessToken,
				locals.tenantId,
				fetch
			);
			redirect(303, '/governance/reports');
		} catch (e) {
			if (e instanceof ApiError) {
				return message(form, e.message, { status: e.status as ErrorStatus });
			}
			throw e;
		}
	}
};
