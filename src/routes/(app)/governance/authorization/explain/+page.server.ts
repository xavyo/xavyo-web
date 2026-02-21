import type { Actions, PageServerLoad } from './$types';
import { superValidate, message, type ErrorStatus } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { fail, redirect } from '@sveltejs/kit';
import { explainNhiSchema } from '$lib/schemas/authorization';
import { explainNhi } from '$lib/api/authorization';
import { ApiError } from '$lib/api/client';
import { hasAdminRole } from '$lib/server/auth';
import type { ExplainNhiResponse } from '$lib/api/types';

export const load: PageServerLoad = async ({ locals }) => {
	if (!hasAdminRole(locals.user?.roles)) {
		redirect(302, '/dashboard');
	}

	const form = await superValidate(zod(explainNhiSchema));
	return { form, result: null as ExplainNhiResponse | null };
};

export const actions: Actions = {
	default: async ({ request, locals, fetch }) => {
		const form = await superValidate(request, zod(explainNhiSchema));

		if (!form.valid) {
			return fail(400, { form, result: null as ExplainNhiResponse | null });
		}

		try {
			const explainResult = await explainNhi(
				{
					nhi_id: form.data.nhi_id,
					action: form.data.action || undefined,
					resource_type: form.data.resource_type || undefined
				},
				locals.accessToken!,
				locals.tenantId!,
				fetch
			);

			return { form, result: explainResult };
		} catch (e) {
			if (e instanceof ApiError) {
				return message(form, e.message, { status: e.status as ErrorStatus });
			}
			return message(form, 'An unexpected error occurred', { status: 500 });
		}
	}
};
