import type { Actions, PageServerLoad } from './$types';
import { superValidate, message, type ErrorStatus } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { fail, redirect } from '@sveltejs/kit';
import { createServiceProviderSchema } from '$lib/schemas/federation';
import { createServiceProvider } from '$lib/api/federation';
import { ApiError } from '$lib/api/client';
import type { CreateServiceProviderRequest } from '$lib/api/types';
import { parseJsonRecord } from '$lib/utils/json-record';

export const load: PageServerLoad = async ({ locals }) => {
	const form = await superValidate(zod(createServiceProviderSchema));
	return { form };
};

export const actions: Actions = {
	default: async ({ request, locals, fetch }) => {
		const form = await superValidate(request, zod(createServiceProviderSchema));
		if (!form.valid) {
			return fail(400, { form });
		}

		// Parse acs_urls string to array (split on newlines and commas)
		const acs_urls = form.data.acs_urls
			.split(/[\n,]/)
			.map((s: string) => s.trim())
			.filter(Boolean);

		if (acs_urls.length === 0) {
			return message(form, 'At least one ACS URL is required', { status: 400 as ErrorStatus });
		}

		// Parse attribute_mapping JSON if provided
		let attribute_mapping: Record<string, unknown> | undefined;
		if (form.data.attribute_mapping) {
			try {
				attribute_mapping = parseJsonRecord(form.data.attribute_mapping);
			} catch {
				return message(form, 'Attribute mapping must be a JSON object', {
					status: 400 as ErrorStatus
				});
			}
		}

		let group_filter: Record<string, unknown> | undefined;
		if (form.data.group_filter) {
			try {
				group_filter = parseJsonRecord(form.data.group_filter);
			} catch {
				return message(form, 'Group filter must be a JSON object', {
					status: 400 as ErrorStatus
				});
			}
		}

		const body: CreateServiceProviderRequest = {
			name: form.data.name,
			entity_id: form.data.entity_id,
			acs_urls,
			certificate: form.data.certificate || undefined,
			attribute_mapping: attribute_mapping ?? undefined,
			name_id_format: form.data.name_id_format || undefined,
			sign_assertions: form.data.sign_assertions,
			validate_signatures: form.data.validate_signatures,
			assertion_validity_seconds: form.data.assertion_validity_seconds,
			metadata_url: form.data.metadata_url || undefined,
			slo_url: form.data.slo_url || undefined,
			slo_binding: form.data.slo_binding || undefined,
			group_attribute_name: form.data.group_attribute_name || undefined,
			group_value_format: form.data.group_value_format || undefined,
			group_filter,
			include_groups: form.data.include_groups,
			omit_empty_groups: form.data.omit_empty_groups,
			group_dn_base: form.data.group_dn_base || undefined
		};

		try {
			await createServiceProvider(body, locals.accessToken!, locals.tenantId!, fetch);
		} catch (e) {
			if (e instanceof ApiError) {
				return message(form, e.message, { status: e.status as ErrorStatus });
			}
			return message(form, 'An unexpected error occurred', { status: 500 as ErrorStatus });
		}

		redirect(302, '/federation?tab=saml');
	}
};
