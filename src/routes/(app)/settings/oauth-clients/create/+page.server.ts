import type { PageServerLoad, Actions } from './$types';
import { superValidate, message, type ErrorStatus } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { fail } from '@sveltejs/kit';
import { createOAuthClientSchema } from '$lib/schemas/oauth-clients';
import { createOAuthClient } from '$lib/api/oauth-clients';
import { ApiError } from '$lib/api/client';

export const load: PageServerLoad = async () => {
	const form = await superValidate(zod(createOAuthClientSchema));
	return { form };
};

export const actions: Actions = {
	default: async ({ request, locals, fetch }) => {
		const form = await superValidate(request, zod(createOAuthClientSchema));
		if (!form.valid) return fail(400, { form });

		try {
			const result = await createOAuthClient(
				{
					name: form.data.name,
					client_type: form.data.client_type as 'confidential' | 'public',
					redirect_uris: form.data.redirect_uris
						.split(',')
						.map((s) => s.trim())
						.filter(Boolean),
					grant_types: form.data.grant_types
						.split(',')
						.map((s) => s.trim())
						.filter(Boolean),
					scopes: form.data.scopes
						.split(',')
						.map((s) => s.trim())
						.filter(Boolean),
					...(form.data.post_logout_redirect_uris
						? {
								post_logout_redirect_uris: form.data.post_logout_redirect_uris
									.split(',')
									.map((s) => s.trim())
									.filter(Boolean)
							}
						: {}),
					...(form.data.logo_url ? { logo_url: form.data.logo_url } : {}),
					...(form.data.description ? { description: form.data.description } : {})
				},
				locals.accessToken!,
				locals.tenantId!,
				fetch
			);

			return {
				form,
				created: true,
				client: result,
				secret: result.client_secret
			};
		} catch (e) {
			if (e instanceof ApiError) {
				return message(form, e.message, { status: e.status as ErrorStatus });
			}
			return message(form, 'An unexpected error occurred', { status: 500 as ErrorStatus });
		}
	}
};
