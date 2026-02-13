import type { PageServerLoad, Actions } from './$types';
import { redirect, error, isHttpError, isRedirect } from '@sveltejs/kit';
import { superValidate, message } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { updateTemplateSchema, cloneTemplateSchema } from '$lib/schemas/governance-reporting';
import { getTemplate, updateTemplate, archiveTemplate, cloneTemplate } from '$lib/api/governance-reporting';
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
		const template = await getTemplate(params.id, locals.accessToken, locals.tenantId, fetch);
		const editForm = await superValidate(
			{ name: template.name, description: template.description ?? undefined },
			zod(updateTemplateSchema)
		);
		const cloneForm = await superValidate(
			{ name: `Copy of ${template.name}` },
			zod(cloneTemplateSchema)
		);
		return { template, editForm, cloneForm };
	} catch (e) {
		if (e instanceof ApiError) error(e.status, e.message);
		throw e;
	}
};

export const actions: Actions = {
	edit: async ({ params, request, locals, fetch }) => {
		if (!locals.accessToken || !locals.tenantId) error(401, 'Unauthorized');

		const form = await superValidate(request, zod(updateTemplateSchema));
		if (!form.valid) return message(form, 'Please fix the errors', { status: 400 as ErrorStatus });

		try {
			await updateTemplate(params.id, form.data as Parameters<typeof updateTemplate>[1], locals.accessToken, locals.tenantId, fetch);
			redirect(303, `/governance/reports/templates/${params.id}`);
		} catch (e) {
			if (isRedirect(e)) throw e;
			if (isHttpError(e)) throw e;
			if (e instanceof ApiError) return message(form, e.message, { status: e.status as ErrorStatus });
			throw e;
		}
	},
	archive: async ({ params, locals, fetch }) => {
		if (!locals.accessToken || !locals.tenantId) error(401, 'Unauthorized');

		try {
			await archiveTemplate(params.id, locals.accessToken, locals.tenantId, fetch);
			redirect(303, '/governance/reports');
		} catch (e) {
			if (isRedirect(e)) throw e;
			if (isHttpError(e)) throw e;
			if (e instanceof ApiError) error(e.status, e.message);
			throw e;
		}
	},
	clone: async ({ params, request, locals, fetch }) => {
		if (!locals.accessToken || !locals.tenantId) error(401, 'Unauthorized');

		const form = await superValidate(request, zod(cloneTemplateSchema));
		if (!form.valid) return message(form, 'Please fix the errors', { status: 400 as ErrorStatus });

		try {
			const cloned = await cloneTemplate(params.id, form.data, locals.accessToken, locals.tenantId, fetch);
			redirect(303, `/governance/reports/templates/${cloned.id}`);
		} catch (e) {
			if (isRedirect(e)) throw e;
			if (isHttpError(e)) throw e;
			if (e instanceof ApiError) return message(form, e.message, { status: e.status as ErrorStatus });
			throw e;
		}
	}
};
