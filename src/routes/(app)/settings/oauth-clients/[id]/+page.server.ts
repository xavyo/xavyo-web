import type { Actions, PageServerLoad } from './$types';
import { superValidate, message, type ErrorStatus } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { error, fail, redirect } from '@sveltejs/kit';
import { updateOAuthClientSchema } from '$lib/schemas/oauth-clients';
import {
	getOAuthClient,
	updateOAuthClient,
	deleteOAuthClient
} from '$lib/api/oauth-clients';
import { ApiError } from '$lib/api/client';
import type { UpdateOAuthClientRequest } from '$lib/api/types';

export const load: PageServerLoad = async ({ params, locals, fetch }) => {
	let client;
	try {
		client = await getOAuthClient(params.id, locals.accessToken!, locals.tenantId!, fetch);
	} catch (e) {
		if (e instanceof ApiError) {
			error(e.status, e.message);
		}
		error(500, 'Failed to load client');
	}

	const form = await superValidate(
		{
			name: client.name,
			redirect_uris: client.redirect_uris.join(', '),
			grant_types: client.grant_types.join(', '),
			scopes: client.scopes.join(', '),
			post_logout_redirect_uris: client.post_logout_redirect_uris.join(', '),
			logo_url: client.logo_url ?? '',
			description: client.description ?? ''
		},
		zod(updateOAuthClientSchema)
	);

	return { client, form };
};

export const actions: Actions = {
	update: async ({ request, params, locals, fetch }) => {
		const form = await superValidate(request, zod(updateOAuthClientSchema));

		if (!form.valid) {
			return fail(400, { form });
		}

		const body: UpdateOAuthClientRequest = {
			name: form.data.name || undefined,
			redirect_uris: form.data.redirect_uris
				? form.data.redirect_uris
						.split(',')
						.map((s) => s.trim())
						.filter(Boolean)
				: undefined,
			grant_types: form.data.grant_types
				? form.data.grant_types
						.split(',')
						.map((s) => s.trim())
						.filter(Boolean)
				: undefined,
			scopes: form.data.scopes
				? form.data.scopes
						.split(',')
						.map((s) => s.trim())
						.filter(Boolean)
				: undefined,
			post_logout_redirect_uris: form.data.post_logout_redirect_uris
				? form.data.post_logout_redirect_uris
						.split(',')
						.map((s) => s.trim())
						.filter(Boolean)
				: undefined,
			...(form.data.logo_url ? { logo_url: form.data.logo_url } : {}),
			...(form.data.description ? { description: form.data.description } : {})
		};

		try {
			await updateOAuthClient(params.id, body, locals.accessToken!, locals.tenantId!, fetch);
		} catch (e) {
			if (e instanceof ApiError) {
				return message(form, e.message, { status: e.status as ErrorStatus });
			}
			return message(form, 'An unexpected error occurred', { status: 500 });
		}

		return message(form, 'OAuth client updated successfully');
	},

	toggleActive: async ({ request, params, locals, fetch }) => {
		const formData = await request.formData();
		const currentIsActive = formData.get('is_active') === 'true';

		try {
			await updateOAuthClient(
				params.id,
				{ is_active: !currentIsActive },
				locals.accessToken!,
				locals.tenantId!,
				fetch
			);
		} catch (e) {
			if (e instanceof ApiError) {
				return fail(e.status, { error: e.message });
			}
			return fail(500, { error: 'An unexpected error occurred' });
		}

		return { success: true, action: 'toggled' };
	},

	delete: async ({ params, locals, fetch }) => {
		try {
			await deleteOAuthClient(params.id, locals.accessToken!, locals.tenantId!, fetch);
		} catch (e) {
			if (e instanceof ApiError) {
				return fail(e.status, { error: e.message });
			}
			return fail(500, { error: 'An unexpected error occurred' });
		}

		redirect(302, '/settings/oauth-clients');
	}
};
