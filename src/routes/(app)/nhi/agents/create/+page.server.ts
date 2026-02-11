import type { Actions, PageServerLoad } from './$types';
import { superValidate, message, type ErrorStatus } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { fail, redirect } from '@sveltejs/kit';
import { createAgentSchema } from '$lib/schemas/nhi';
import { createAgent } from '$lib/api/nhi';
import { ApiError } from '$lib/api/client';
import type { CreateAgentRequest } from '$lib/api/types';

export const load: PageServerLoad = async () => {
	const form = await superValidate(zod(createAgentSchema));
	return { form };
};

export const actions: Actions = {
	default: async ({ request, locals, fetch }) => {
		const form = await superValidate(request, zod(createAgentSchema));

		if (!form.valid) {
			return fail(400, { form });
		}

		const body: CreateAgentRequest = {
			name: form.data.name,
			agent_type: form.data.agent_type,
			description: form.data.description || undefined,
			model_provider: form.data.model_provider || undefined,
			model_name: form.data.model_name || undefined,
			model_version: form.data.model_version || undefined,
			max_token_lifetime_secs: form.data.max_token_lifetime_secs || undefined,
			requires_human_approval: form.data.requires_human_approval || false
		};

		try {
			await createAgent(body, locals.accessToken!, locals.tenantId!, fetch);
		} catch (e) {
			if (e instanceof ApiError) {
				return message(form, e.message, { status: e.status as ErrorStatus });
			}
			return message(form, 'An unexpected error occurred', { status: 500 });
		}

		redirect(302, '/nhi');
	}
};
