import { redirect, isRedirect, isHttpError } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { superValidate, message } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import type { ErrorStatus } from 'sveltekit-superforms';
import { createScriptTemplateSchema } from '$lib/schemas/provisioning-scripts';
import { hasAdminRole } from '$lib/server/auth';
import { createScriptTemplate } from '$lib/api/provisioning-scripts';
import { ApiError } from '$lib/api/client';

export const load: PageServerLoad = async ({ locals }) => {
	const { accessToken, tenantId, user } = locals;
	if (!accessToken || !tenantId) throw redirect(302, '/login');
	if (!hasAdminRole(user?.roles ?? [])) throw redirect(302, '/');

	const form = await superValidate(zod(createScriptTemplateSchema));
	return { form };
};

export const actions: Actions = {
	default: async ({ request, locals }) => {
		const { accessToken, tenantId } = locals;
		if (!accessToken || !tenantId) throw redirect(302, '/login');

		const form = await superValidate(request, zod(createScriptTemplateSchema));
		if (!form.valid) return message(form, 'Please fix the errors below', { status: 400 as ErrorStatus });

		try {
			const result = await createScriptTemplate(
				{
					name: form.data.name,
					description: form.data.description || undefined,
					category: form.data.category,
					template_body: form.data.template_body,
					placeholder_annotations: form.data.placeholder_annotations ? JSON.parse(form.data.placeholder_annotations) : undefined
				},
				accessToken,
				tenantId
			);
			throw redirect(302, `/governance/provisioning-scripts/templates/${result.id}`);
		} catch (e) {
			if (isRedirect(e)) throw e;
			if (isHttpError(e)) return message(form, e.body?.message || 'Failed to create template', { status: e.status as ErrorStatus });
			if (e instanceof ApiError) return message(form, e.message, { status: (e.status || 500) as ErrorStatus });
			return message(form, 'An unexpected error occurred', { status: 500 as ErrorStatus });
		}
	}
};
