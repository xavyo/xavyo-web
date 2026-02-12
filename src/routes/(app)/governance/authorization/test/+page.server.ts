import type { Actions, PageServerLoad } from './$types';
import { superValidate, message, type ErrorStatus } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { fail, redirect } from '@sveltejs/kit';
import { authCheckSchema } from '$lib/schemas/authorization';
import { checkAuthorization } from '$lib/api/authorization';
import { ApiError } from '$lib/api/client';
import { hasAdminRole } from '$lib/server/auth';
import type { AuthorizationDecision } from '$lib/api/types';

export const load: PageServerLoad = async ({ locals }) => {
	if (!hasAdminRole(locals.user?.roles)) {
		redirect(302, '/dashboard');
	}

	const form = await superValidate(zod(authCheckSchema));
	return { form, result: null as AuthorizationDecision | null };
};

export const actions: Actions = {
	default: async ({ request, locals, fetch }) => {
		const form = await superValidate(request, zod(authCheckSchema));

		if (!form.valid) {
			return fail(400, { form, result: null as AuthorizationDecision | null });
		}

		try {
			const checkResult = await checkAuthorization(
				{
					user_id: form.data.user_id,
					action: form.data.action,
					resource_type: form.data.resource_type,
					resource_id: form.data.resource_id || undefined
				},
				locals.accessToken!,
				locals.tenantId!,
				fetch
			);

			return { form, result: checkResult };
		} catch (e) {
			if (e instanceof ApiError) {
				return message(form, e.message, { status: e.status as ErrorStatus });
			}
			return message(form, 'An unexpected error occurred', { status: 500 });
		}
	}
};
