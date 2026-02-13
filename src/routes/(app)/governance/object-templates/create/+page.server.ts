import type { Actions, PageServerLoad } from './$types';
import { superValidate, message, type ErrorStatus } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { fail, redirect, isRedirect, isHttpError } from '@sveltejs/kit';
import { createObjectTemplateSchema } from '$lib/schemas/object-templates';
import { createObjectTemplate } from '$lib/api/object-templates';
import { ApiError } from '$lib/api/client';
import { hasAdminRole } from '$lib/server/auth';

export const load: PageServerLoad = async ({ locals }) => {
	if (!hasAdminRole(locals.user?.roles)) {
		redirect(302, '/dashboard');
	}

	const form = await superValidate(zod(createObjectTemplateSchema));
	return { form };
};

export const actions: Actions = {
	default: async ({ request, locals, fetch }) => {
		const form = await superValidate(request, zod(createObjectTemplateSchema));

		if (!form.valid) {
			return fail(400, { form });
		}

		const { data } = form;

		const body: Record<string, unknown> = {
			name: data.name,
			description: data.description || null,
			object_type: data.object_type,
			priority: data.priority
		};

		try {
			await createObjectTemplate(body, locals.accessToken!, locals.tenantId!, fetch);
		} catch (e) {
			if (isRedirect(e)) throw e;
			if (isHttpError(e)) {
				return message(form, e.body?.message || 'Failed to create template', {
					status: e.status as ErrorStatus
				});
			}
			if (e instanceof ApiError) {
				return message(form, e.message, { status: (e.status || 500) as ErrorStatus });
			}
			return message(form, 'An unexpected error occurred', { status: 500 as ErrorStatus });
		}

		redirect(302, '/governance/object-templates');
	}
};
