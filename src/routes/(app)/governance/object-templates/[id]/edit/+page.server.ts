import type { Actions, PageServerLoad } from './$types';
import { superValidate, message, type ErrorStatus } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { fail, redirect, error, isRedirect, isHttpError } from '@sveltejs/kit';
import { updateObjectTemplateSchema } from '$lib/schemas/object-templates';
import { getObjectTemplate, updateObjectTemplate } from '$lib/api/object-templates';
import { ApiError } from '$lib/api/client';
import { hasAdminRole } from '$lib/server/auth';

export const load: PageServerLoad = async ({ locals, params }) => {
	if (!hasAdminRole(locals.user?.roles)) {
		redirect(302, '/dashboard');
	}

	try {
		const template = await getObjectTemplate(params.id, locals.accessToken!, locals.tenantId!);
		const form = await superValidate(
			{
				name: template.name,
				description: template.description || '',
				priority: template.priority
			},
			zod(updateObjectTemplateSchema)
		);
		return { form, template };
	} catch {
		error(404, 'Template not found');
	}
};

export const actions: Actions = {
	default: async ({ request, locals, params, fetch }) => {
		const form = await superValidate(request, zod(updateObjectTemplateSchema));

		if (!form.valid) {
			return fail(400, { form });
		}

		const { data } = form;

		const body: Record<string, unknown> = {
			name: data.name,
			description: data.description || null,
			priority: data.priority
		};

		try {
			await updateObjectTemplate(params.id, body, locals.accessToken!, locals.tenantId!, fetch);
		} catch (e) {
			if (isRedirect(e)) throw e;
			if (isHttpError(e)) {
				return message(form, e.body?.message || 'Failed to update template', {
					status: e.status as ErrorStatus
				});
			}
			if (e instanceof ApiError) {
				return message(form, e.message, { status: (e.status || 500) as ErrorStatus });
			}
			return message(form, 'An unexpected error occurred', { status: 500 as ErrorStatus });
		}

		redirect(302, `/governance/object-templates/${params.id}`);
	}
};
