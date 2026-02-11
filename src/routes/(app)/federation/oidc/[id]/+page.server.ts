import type { Actions, PageServerLoad } from './$types';
import { superValidate, message, type ErrorStatus } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { error, fail, redirect } from '@sveltejs/kit';
import { hasAdminRole } from '$lib/server/auth';
import { updateIdentityProviderSchema } from '$lib/schemas/federation';
import {
	getIdentityProvider,
	updateIdentityProvider,
	deleteIdentityProvider,
	validateIdentityProvider,
	toggleIdentityProvider,
	listDomains
} from '$lib/api/federation';
import { ApiError } from '$lib/api/client';
import type { UpdateIdentityProviderRequest } from '$lib/api/types';

export const load: PageServerLoad = async ({ params, locals, fetch }) => {
	if (!hasAdminRole(locals.user?.roles)) {
		redirect(302, '/dashboard');
	}

	let idp;
	let domains;
	try {
		[idp, domains] = await Promise.all([
			getIdentityProvider(params.id, locals.accessToken!, locals.tenantId!, fetch),
			listDomains(params.id, locals.accessToken!, locals.tenantId!, fetch)
		]);
	} catch (e) {
		if (e instanceof ApiError) {
			error(e.status, e.message);
		}
		error(500, 'Failed to load identity provider');
	}

	const form = await superValidate(
		{
			name: idp.name,
			provider_type: idp.provider_type ?? 'generic_oidc',
			issuer_url: idp.issuer_url,
			client_id: idp.client_id,
			client_secret: '', // Don't pre-fill secret
			scopes: idp.scopes ?? '',
			claim_mapping: idp.claim_mapping
				? JSON.stringify(idp.claim_mapping, null, 2)
				: '',
			sync_on_login: idp.sync_on_login ?? false
		},
		zod(updateIdentityProviderSchema)
	);

	return { idp, domains: domains.items ?? [], form };
};

export const actions: Actions = {
	update: async ({ request, params, locals, fetch }) => {
		const form = await superValidate(request, zod(updateIdentityProviderSchema));
		if (!form.valid) {
			return fail(400, { form });
		}

		let claim_mapping: Record<string, string> | undefined;
		if (form.data.claim_mapping) {
			try {
				claim_mapping = JSON.parse(form.data.claim_mapping) as Record<string, string>;
			} catch {
				return message(form, 'Claim mapping must be valid JSON', { status: 400 as ErrorStatus });
			}
		}

		const body: UpdateIdentityProviderRequest = {
			name: form.data.name || undefined,
			provider_type: form.data.provider_type || undefined,
			issuer_url: form.data.issuer_url || undefined,
			client_id: form.data.client_id || undefined,
			client_secret: form.data.client_secret || undefined,
			scopes: form.data.scopes || undefined,
			claim_mapping: claim_mapping ?? undefined,
			sync_on_login: form.data.sync_on_login
		};

		try {
			await updateIdentityProvider(params.id, body, locals.accessToken!, locals.tenantId!, fetch);
		} catch (e) {
			if (e instanceof ApiError) {
				return message(form, e.message, { status: e.status as ErrorStatus });
			}
			return message(form, 'An unexpected error occurred', { status: 500 as ErrorStatus });
		}

		return message(form, 'Identity provider updated successfully');
	},

	delete: async ({ params, locals, fetch }) => {
		try {
			await deleteIdentityProvider(params.id, locals.accessToken!, locals.tenantId!, fetch);
		} catch (e) {
			if (e instanceof ApiError) {
				return fail(e.status, { error: e.message });
			}
			return fail(500, { error: 'An unexpected error occurred' });
		}
		redirect(302, '/federation?tab=oidc');
	},

	validate: async ({ params, locals, fetch }) => {
		try {
			const result = await validateIdentityProvider(
				params.id,
				locals.accessToken!,
				locals.tenantId!,
				fetch
			);
			return { success: true, action: 'validated', validationResult: result };
		} catch (e) {
			if (e instanceof ApiError) {
				return fail(e.status, { error: e.message });
			}
			return fail(500, { error: 'An unexpected error occurred' });
		}
	},

	toggle: async ({ request, params, locals, fetch }) => {
		const formData = await request.formData();
		const isEnabled = formData.get('is_enabled') === 'true';
		try {
			await toggleIdentityProvider(
				params.id,
				{ is_enabled: isEnabled },
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
		return { success: true, action: isEnabled ? 'enabled' : 'disabled' };
	}
};
