import type { Actions, PageServerLoad } from './$types';
import { superValidate, message, type ErrorStatus } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { fail, redirect } from '@sveltejs/kit';
import { hasAdminRole } from '$lib/server/auth';
import { createIdentityProviderSchema } from '$lib/schemas/federation';
import { createIdentityProvider } from '$lib/api/federation';
import { ApiError } from '$lib/api/client';
import type { CreateIdentityProviderRequest } from '$lib/api/types';

export const load: PageServerLoad = async ({ locals }) => {
	if (!hasAdminRole(locals.user?.roles)) {
		redirect(302, '/dashboard');
	}
	const form = await superValidate(
		{ provider_type: 'generic_oidc' },
		zod(createIdentityProviderSchema)
	);
	return { form };
};

export const actions: Actions = {
	default: async ({ request, locals, fetch }) => {
		const form = await superValidate(request, zod(createIdentityProviderSchema));
		if (!form.valid) {
			return fail(400, { form });
		}

		// Parse claim_mapping JSON if provided
		let claim_mapping: Record<string, string> | undefined;
		if (form.data.claim_mapping) {
			try {
				claim_mapping = JSON.parse(form.data.claim_mapping) as Record<string, string>;
			} catch {
				return message(form, 'Claim mapping must be valid JSON', { status: 400 as ErrorStatus });
			}
		}

		const body: CreateIdentityProviderRequest = {
			name: form.data.name,
			provider_type: form.data.provider_type,
			issuer_url: form.data.issuer_url,
			client_id: form.data.client_id,
			client_secret: form.data.client_secret,
			scopes: form.data.scopes || undefined,
			claim_mapping: claim_mapping ?? undefined,
			sync_on_login: form.data.sync_on_login
		};

		try {
			await createIdentityProvider(body, locals.accessToken!, locals.tenantId!, fetch);
		} catch (e) {
			if (e instanceof ApiError) {
				return message(form, e.message, { status: e.status as ErrorStatus });
			}
			return message(form, 'An unexpected error occurred', { status: 500 as ErrorStatus });
		}

		redirect(302, '/federation?tab=oidc');
	}
};
