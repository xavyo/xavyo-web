import type { Actions, PageServerLoad } from './$types';
import { superValidate, message, type ErrorStatus } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { error, fail, redirect } from '@sveltejs/kit';
import { updateArchetypeSchema } from '$lib/schemas/persona';
import {
	getArchetype,
	updateArchetype,
	deleteArchetype,
	activateArchetype,
	deactivateArchetype
} from '$lib/api/personas';
import { ApiError } from '$lib/api/client';
import type { UpdateArchetypeRequest, LifecyclePolicyRequest } from '$lib/api/types';

export const load: PageServerLoad = async ({ params, locals, fetch }) => {
	let archetype;
	try {
		archetype = await getArchetype(params.id, locals.accessToken!, locals.tenantId!, fetch);
	} catch (e) {
		if (e instanceof ApiError) {
			error(e.status, e.message);
		}
		error(500, 'Failed to load archetype');
	}

	const form = await superValidate(
		{
			name: archetype.name,
			description: archetype.description ?? undefined,
			naming_pattern: archetype.naming_pattern,
			default_validity_days: archetype.lifecycle_policy?.default_validity_days,
			max_validity_days: archetype.lifecycle_policy?.max_validity_days,
			notification_before_expiry_days: archetype.lifecycle_policy?.notification_before_expiry_days
		},
		zod(updateArchetypeSchema)
	);

	return { archetype, form };
};

export const actions: Actions = {
	update: async ({ request, params, locals, fetch }) => {
		const form = await superValidate(request, zod(updateArchetypeSchema));

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

		const body: UpdateArchetypeRequest = {
			name: form.data.name || undefined,
			description: form.data.description || undefined,
			naming_pattern: form.data.naming_pattern || undefined
		};

		if (Object.keys(lifecyclePolicy).length > 0) {
			body.lifecycle_policy = lifecyclePolicy;
		}

		try {
			await updateArchetype(params.id, body, locals.accessToken!, locals.tenantId!, fetch);
		} catch (e) {
			if (e instanceof ApiError) {
				return message(form, e.message, { status: e.status as ErrorStatus });
			}
			return message(form, 'An unexpected error occurred', { status: 500 });
		}

		return message(form, 'Archetype updated successfully');
	},

	delete: async ({ params, locals, fetch }) => {
		try {
			await deleteArchetype(params.id, locals.accessToken!, locals.tenantId!, fetch);
		} catch (e) {
			if (e instanceof ApiError) {
				return fail(e.status, { error: e.message });
			}
			return fail(500, { error: 'An unexpected error occurred' });
		}

		redirect(302, '/personas/archetypes');
	},

	activate: async ({ params, locals, fetch }) => {
		try {
			await activateArchetype(params.id, locals.accessToken!, locals.tenantId!, fetch);
		} catch (e) {
			if (e instanceof ApiError) {
				return fail(e.status, { error: e.message });
			}
			return fail(500, { error: 'An unexpected error occurred' });
		}

		return { success: true, action: 'activated' };
	},

	deactivate: async ({ params, locals, fetch }) => {
		try {
			await deactivateArchetype(params.id, locals.accessToken!, locals.tenantId!, fetch);
		} catch (e) {
			if (e instanceof ApiError) {
				return fail(e.status, { error: e.message });
			}
			return fail(500, { error: 'An unexpected error occurred' });
		}

		return { success: true, action: 'deactivated' };
	}
};
