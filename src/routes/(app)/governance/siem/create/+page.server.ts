import type { Actions, PageServerLoad } from './$types';
import { superValidate, message, type ErrorStatus } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { fail, redirect, isRedirect, isHttpError } from '@sveltejs/kit';
import { createSiemDestinationSchema } from '$lib/schemas/siem';
import { createSiemDestination } from '$lib/api/siem';
import { ApiError } from '$lib/api/client';
import { hasAdminRole } from '$lib/server/auth';
import type { CreateSiemDestinationRequest } from '$lib/api/types';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.accessToken || !locals.tenantId) {
		redirect(302, '/login');
	}
	if (!hasAdminRole(locals.user?.roles)) {
		redirect(302, '/');
	}

	const form = await superValidate(zod(createSiemDestinationSchema));
	return { form };
};

export const actions: Actions = {
	default: async ({ request, locals, fetch }) => {
		if (!locals.accessToken || !locals.tenantId) {
			redirect(302, '/login');
		}

		const form = await superValidate(request, zod(createSiemDestinationSchema));
		if (!form.valid) {
			return fail(400, { form });
		}

		const body: CreateSiemDestinationRequest = {
			name: form.data.name,
			destination_type: form.data.destination_type,
			endpoint_host: form.data.endpoint_host,
			endpoint_port: form.data.endpoint_port ?? undefined,
			export_format: form.data.export_format,
			event_type_filter:
				form.data.event_type_filter.length > 0 ? form.data.event_type_filter : undefined,
			rate_limit_per_second: form.data.rate_limit_per_second,
			queue_buffer_size: form.data.queue_buffer_size,
			circuit_breaker_threshold: form.data.circuit_breaker_threshold,
			circuit_breaker_cooldown_secs: form.data.circuit_breaker_cooldown_secs,
			enabled: form.data.enabled,
			splunk_source: form.data.splunk_source || undefined,
			splunk_sourcetype: form.data.splunk_sourcetype || undefined,
			splunk_index: form.data.splunk_index || undefined,
			splunk_ack_enabled: form.data.splunk_ack_enabled,
			syslog_facility: form.data.syslog_facility,
			tls_verify_cert: form.data.tls_verify_cert,
			auth_config_b64: form.data.auth_config_b64 || undefined
		};

		try {
			const result = await createSiemDestination(
				body,
				locals.accessToken,
				locals.tenantId,
				fetch
			);
			redirect(302, `/governance/siem/${result.id}`);
		} catch (e) {
			if (isRedirect(e)) throw e;
			if (isHttpError(e)) {
				return message(form, e.body.message ?? 'Request failed', {
					status: e.status as ErrorStatus
				});
			}
			if (e instanceof ApiError) {
				return message(form, e.message, { status: e.status as ErrorStatus });
			}
			return message(form, 'Failed to create destination', { status: 500 as ErrorStatus });
		}
	}
};
