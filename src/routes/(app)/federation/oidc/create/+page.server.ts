import type { Actions, PageServerLoad } from './$types';
import { superValidate, message, type ErrorStatus } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { fail, redirect } from '@sveltejs/kit';
import { createIdentityProviderSchema } from '$lib/schemas/federation';
import { createIdentityProvider } from '$lib/api/federation';
import { ApiError } from '$lib/api/client';
import type { CreateIdentityProviderRequest } from '$lib/api/types';
import { parseClaimMappingJson } from '$lib/utils/claim-mapping';
import { isJsonParseError } from '$lib/utils/json-record';

export const load: PageServerLoad = async ({ locals }) => {
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

		let claim_mapping: CreateIdentityProviderRequest['claim_mapping'];
		if (form.data.claim_mapping) {
			try {
				claim_mapping = parseClaimMappingJson(form.data.claim_mapping);
			} catch (e) {
				if (isJsonParseError(e)) {
					return message(form, 'Claim mapping must be a JSON object', {
						status: 400 as ErrorStatus
					});
				}
				throw e;
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
