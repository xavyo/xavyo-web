import type { Actions, PageServerLoad } from './$types';
import { superValidate, message, type ErrorStatus } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { fail, redirect } from '@sveltejs/kit';
import { loginSchema } from '$lib/schemas/auth';
import { dev } from '$app/environment';
import { login } from '$lib/api/auth';
import { setCookies, SYSTEM_TENANT_ID, decodeAccessToken } from '$lib/server/auth';
import { ApiError } from '$lib/api/client';

export const load: PageServerLoad = async ({ locals, url }) => {
	if (locals.user) {
		redirect(302, '/dashboard');
	}

	const form = await superValidate(zod(loginSchema));
	return { form, redirectTo: url.searchParams.get('redirectTo') ?? '' };
};

export const actions: Actions = {
	default: async ({ request, cookies, fetch, url }) => {
		const form = await superValidate(request, zod(loginSchema));

		if (!form.valid) {
			return fail(400, { form });
		}

		const tenantId = cookies.get('tenant_id') || SYSTEM_TENANT_ID;

		try {
			const tokens = await login(
				{
					email: form.data.email,
					password: form.data.password
				},
				tenantId,
				fetch
			);

			setCookies(cookies, tokens);

			// Ensure tenant_id cookie is set from JWT claims
			const claims = decodeAccessToken(tokens.access_token);
			if (claims?.tid) {
				cookies.set('tenant_id', claims.tid, {
					httpOnly: true,
					secure: !dev,
					sameSite: 'lax',
					path: '/',
					maxAge: 60 * 60 * 24 * 30
				});
			}
		} catch (e) {
			if (e instanceof ApiError) {
				// Email not verified — redirect to check-email page
				if (e.errorType.endsWith('email-not-verified')) {
					redirect(302, `/check-email?email=${encodeURIComponent(form.data.email)}`);
				}
				return message(form, e.message, { status: e.status as ErrorStatus });
			}
			return message(form, 'An unexpected error occurred', { status: 500 });
		}

		const redirectTo = url.searchParams.get('redirectTo');
		if (redirectTo && redirectTo.startsWith('/') && !redirectTo.startsWith('//')) {
			redirect(302, redirectTo);
		}
		redirect(302, '/dashboard');
	}
};
