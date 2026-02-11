import type { Actions, PageServerLoad } from './$types';
import { superValidate, message, type ErrorStatus } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { fail, redirect } from '@sveltejs/kit';
import { createArchetypeSchema } from '$lib/schemas/persona';
import { createArchetype } from '$lib/api/personas';
import { ApiError } from '$lib/api/client';
import type { CreateArchetypeRequest, LifecyclePolicyRequest } from '$lib/api/types';

export const load: PageServerLoad = async () => {
	const form = await superValidate(zod(createArchetypeSchema));
	return { form };
};

export const actions: Actions = {
	default: async ({ request, locals, fetch }) => {
		const form = await superValidate(request, zod(createArchetypeSchema));

		if (!form.valid) {
			return fail(400, { form });
		}

		const lifecyclePolicy: LifecyclePolicyRequest = {};
		if (form.data.default_validity_days) {
			lifecyclePolicy.default_validity_days = form.data.default_validity_days;
		}
		if (form.data.max_validity_days) {
			lifecyclePolicy.max_validity_days = form.data.max_validity_days;
		}
		if (form.data.notification_before_expiry_days) {
			lifecyclePolicy.notification_before_expiry_days = form.data.notification_before_expiry_days;
		}

		const body: CreateArchetypeRequest = {
			name: form.data.name,
			naming_pattern: form.data.naming_pattern,
			description: form.data.description || undefined
		};

		if (Object.keys(lifecyclePolicy).length > 0) {
			body.lifecycle_policy = lifecyclePolicy;
		}

		try {
			await createArchetype(body, locals.accessToken!, locals.tenantId!, fetch);
		} catch (e) {
			if (e instanceof ApiError) {
				return message(form, e.message, { status: e.status as ErrorStatus });
			}
			return message(form, 'An unexpected error occurred', { status: 500 });
		}

		redirect(302, '/personas/archetypes');
	}
};
