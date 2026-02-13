import type { Actions, PageServerLoad } from './$types';
import { superValidate, message, type ErrorStatus } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { error, fail, redirect } from '@sveltejs/kit';
import { hasAdminRole } from '$lib/server/auth';
import { updateServiceProviderSchema } from '$lib/schemas/federation';
import { getServiceProvider, updateServiceProvider, deleteServiceProvider } from '$lib/api/federation';
import { ApiError } from '$lib/api/client';
import type { UpdateServiceProviderRequest } from '$lib/api/types';

export const load: PageServerLoad = async ({ params, locals, fetch }) => {
	if (!hasAdminRole(locals.user?.roles)) {
		redirect(302, '/dashboard');
	}

	let sp;
	try {
		sp = await getServiceProvider(params.id, locals.accessToken!, locals.tenantId!, fetch);
	} catch (e) {
		if (e instanceof ApiError) {
			error(e.status, e.message);
		}
		error(500, 'Failed to load service provider');
	}

	const form = await superValidate(
		{
			name: sp.name,
			entity_id: sp.entity_id,
			acs_urls: sp.acs_urls.join('\n'),
			certificate: sp.certificate ?? '',
			attribute_mapping: sp.attribute_mapping
				? JSON.stringify(sp.attribute_mapping, null, 2)
				: '',
			name_id_format: sp.name_id_format ?? '',
			sign_assertions: sp.sign_assertions,
			validate_signatures: sp.validate_signatures,
			assertion_validity_seconds: sp.assertion_validity_seconds,
			metadata_url: sp.metadata_url ?? '',
			enabled: sp.enabled
		},
		zod(updateServiceProviderSchema)
	);

	return { sp, form };
};

export const actions: Actions = {
	update: async ({ request, params, locals, fetch }) => {
		const form = await superValidate(request, zod(updateServiceProviderSchema));
		if (!form.valid) {
			return fail(400, { form });
		}

		// Parse acs_urls string to array (split on newlines and commas)
		let acs_urls: string[] | undefined;
		if (form.data.acs_urls) {
			acs_urls = form.data.acs_urls
				.split(/[\n,]/)
				.map((s: string) => s.trim())
				.filter(Boolean);
		}

		// Parse attribute_mapping JSON if provided
		let attribute_mapping: Record<string, unknown> | undefined;
		if (form.data.attribute_mapping) {
			try {
				attribute_mapping = JSON.parse(form.data.attribute_mapping) as Record<string, unknown>;
			} catch {
				return message(form, 'Attribute mapping must be valid JSON', {
					status: 400 as ErrorStatus
				});
			}
		}

		const body: UpdateServiceProviderRequest = {
			name: form.data.name || undefined,
			entity_id: form.data.entity_id || undefined,
			acs_urls,
			certificate: form.data.certificate || undefined,
			attribute_mapping: attribute_mapping ?? undefined,
			name_id_format: form.data.name_id_format || undefined,
			sign_assertions: form.data.sign_assertions,
			validate_signatures: form.data.validate_signatures,
			assertion_validity_seconds: form.data.assertion_validity_seconds,
			enabled: form.data.enabled,
			metadata_url: form.data.metadata_url || undefined
		};

		try {
			await updateServiceProvider(params.id, body, locals.accessToken!, locals.tenantId!, fetch);
		} catch (e) {
			if (e instanceof ApiError) {
				return message(form, e.message, { status: e.status as ErrorStatus });
			}
			return message(form, 'An unexpected error occurred', { status: 500 as ErrorStatus });
		}

		return message(form, 'Service provider updated successfully');
	},

	delete: async ({ params, locals, fetch }) => {
		try {
			await deleteServiceProvider(params.id, locals.accessToken!, locals.tenantId!, fetch);
		} catch (e) {
			if (e instanceof ApiError) {
				return fail(e.status, { error: e.message });
			}
			return fail(500, { error: 'An unexpected error occurred' });
		}
		redirect(302, '/federation?tab=saml');
	}
};
