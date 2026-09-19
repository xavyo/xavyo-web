import type { Actions, PageServerLoad } from './$types';
import { superValidate, message, type ErrorStatus } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { fail, redirect } from '@sveltejs/kit';
import { dev } from '$app/environment';
import { signupSchema } from '$lib/schemas/auth';
import { signupTenant } from '$lib/api/tenants';
import { ApiError } from '$lib/api/client';

export const load: PageServerLoad = async ({ locals }) => {
	if (locals.user) {
		redirect(302, '/dashboard');
	}

	const form = await superValidate(zod(signupSchema));
	return { form };
};

export const actions: Actions = {
	default: async ({ request, fetch, cookies }) => {
		const form = await superValidate(request, zod(signupSchema));

		if (!form.valid) {
			return fail(400, { form });
		}

		let tenantId: string;
		try {
			const result = await signupTenant(
				{
					organization_name: form.data.organizationName,
					email: form.data.email,
					password: form.data.password,
					display_name: form.data.displayName
				},
				fetch
			);
			tenantId = result.tenant.id;
		} catch (e) {
			if (e instanceof ApiError) {
				return message(form, e.message, { status: e.status as ErrorStatus });
			}
			return message(form, 'An unexpected error occurred', { status: 500 });
		}

		cookies.set('tenant_id', tenantId, {
			httpOnly: true,
			secure: !dev,
			sameSite: 'lax',
			path: '/',
			maxAge: 60 * 60 * 24 * 30
		});

		redirect(
			302,
			`/check-email?email=${encodeURIComponent(form.data.email)}&tenant=${encodeURIComponent(tenantId)}`
		);
	}
};
