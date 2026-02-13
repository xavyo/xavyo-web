import type { Actions, PageServerLoad } from './$types';
import { superValidate, message, type ErrorStatus } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { fail, redirect } from '@sveltejs/kit';
import { createA2aTaskSchema } from '$lib/schemas/nhi-protocols';
import { createA2aTask } from '$lib/api/a2a';
import { ApiError } from '$lib/api/client';

export const load: PageServerLoad = async () => {
	const form = await superValidate(zod(createA2aTaskSchema));
	return { form };
};

export const actions: Actions = {
	default: async ({ request, locals, fetch }) => {
		const form = await superValidate(request, zod(createA2aTaskSchema));
		if (!form.valid) return fail(400, { form });

		try {
			const input = JSON.parse(form.data.input) as Record<string, unknown>;
			await createA2aTask(
				{
					target_agent_id: form.data.target_agent_id,
					task_type: form.data.task_type,
					input,
					callback_url: form.data.callback_url || undefined,
					source_agent_id: form.data.source_agent_id || undefined
				},
				locals.accessToken!,
				locals.tenantId!,
				fetch
			);
		} catch (e) {
			if (e instanceof SyntaxError) {
				return message(form, 'Invalid JSON input', { status: 400 as ErrorStatus });
			}
			if (e instanceof ApiError) {
				return message(form, e.message, { status: e.status as ErrorStatus });
			}
			return message(form, 'An unexpected error occurred', { status: 500 });
		}

		redirect(302, '/nhi/a2a');
	}
};
