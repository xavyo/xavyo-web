import type { PageServerLoad, Actions } from './$types';
import { redirect, error, isHttpError, isRedirect } from '@sveltejs/kit';
import { superValidate, message } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { createTemplateSchema } from '$lib/schemas/governance-reporting';
import { createTemplate } from '$lib/api/governance-reporting';
import { ApiError } from '$lib/api/client';
import { hasAdminRole } from '$lib/server/auth';
import type { ErrorStatus } from 'sveltekit-superforms';

export const load: PageServerLoad = async ({ locals }) => {
	if (!hasAdminRole(locals.user?.roles)) {
		redirect(302, '/dashboard');
	}
	const form = await superValidate(zod(createTemplateSchema));
	return { form };
};

export const actions: Actions = {
	default: async ({ request, locals, fetch }) => {
		if (!locals.accessToken || !locals.tenantId) {
			error(401, 'Unauthorized');
		}

		const form = await superValidate(request, zod(createTemplateSchema));
		if (!form.valid) return message(form, 'Please fix the errors', { status: 400 as ErrorStatus });

		try {
			await createTemplate(form.data as Parameters<typeof createTemplate>[0], locals.accessToken, locals.tenantId, fetch);
			redirect(303, '/governance/reports');
		} catch (e) {
			if (isRedirect(e)) throw e;
			if (isHttpError(e)) throw e;
			if (e instanceof ApiError) {
				return message(form, e.message, { status: e.status as ErrorStatus });
			}
			throw e;
		}
	}
};
