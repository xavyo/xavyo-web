import type { Actions, PageServerLoad } from './$types';
import { superValidate, message, type ErrorStatus } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { error, fail, redirect } from '@sveltejs/kit';
import { createMappingSchema } from '$lib/schemas/authorization';
import { createMapping } from '$lib/api/authorization';
import { listEntitlements } from '$lib/api/governance';
import { ApiError } from '$lib/api/client';
import { hasAdminRole } from '$lib/server/auth';

export const load: PageServerLoad = async ({ locals, fetch }) => {
	if (!hasAdminRole(locals.user?.roles)) {
		redirect(302, '/dashboard');
	}

	const form = await superValidate(zod(createMappingSchema));

	try {
		const result = await listEntitlements(
			{ limit: 100, offset: 0 },
			locals.accessToken!,
			locals.tenantId!,
			fetch
		);
		return {
			form,
			entitlements: result.items.map((e) => ({ id: e.id, name: e.name }))
		};
	} catch (e) {
		if (e instanceof ApiError) error(e.status, e.message);
		error(500, 'Failed to load entitlements');
	}
};

export const actions: Actions = {
	default: async ({ request, locals, fetch }) => {
		const form = await superValidate(request, zod(createMappingSchema));
		if (!form.valid) return fail(400, { form });

		try {
			await createMapping(
				{
					entitlement_id: form.data.entitlement_id,
					action: form.data.action,
					resource_type: form.data.resource_type
				},
				locals.accessToken!,
				locals.tenantId!,
				fetch
			);
		} catch (e) {
			if (e instanceof ApiError) {
				return message(form, e.message, { status: e.status as ErrorStatus });
			}
			return message(form, 'An unexpected error occurred', { status: 500 });
		}

		redirect(302, '/governance/authorization/mappings');
	}
};
