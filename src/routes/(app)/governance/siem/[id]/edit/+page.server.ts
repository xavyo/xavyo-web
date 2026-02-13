import type { PageServerLoad, Actions } from './$types';
import { hasAdminRole } from '$lib/server/auth';
import { redirect, fail, isRedirect, isHttpError } from '@sveltejs/kit';
import { superValidate, message, type ErrorStatus } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { updateSiemDestinationSchema } from '$lib/schemas/siem';
import { getSiemDestination, updateSiemDestination } from '$lib/api/siem';
import { ApiError } from '$lib/api/client';
import type { UpdateSiemDestinationRequest } from '$lib/api/types';

export const load: PageServerLoad = async ({ params, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) {
		redirect(302, '/login');
	}
	if (!hasAdminRole(locals.user?.roles)) {
		redirect(302, '/');
	}

	const destination = await getSiemDestination(
		params.id,
		locals.accessToken,
		locals.tenantId,
		fetch
	);

	const form = await superValidate(
		{
			name: destination.name,
			endpoint_host: destination.endpoint_host,
			endpoint_port: destination.endpoint_port ?? undefined,
			export_format: destination.export_format,
			event_type_filter: destination.event_type_filter,
			rate_limit_per_second: destination.rate_limit_per_second,
			queue_buffer_size: destination.queue_buffer_size,
			circuit_breaker_threshold: destination.circuit_breaker_threshold,
			circuit_breaker_cooldown_secs: destination.circuit_breaker_cooldown_secs,
			enabled: destination.enabled,
			splunk_source: destination.splunk_source ?? undefined,
			splunk_sourcetype: destination.splunk_sourcetype ?? undefined,
			splunk_index: destination.splunk_index ?? undefined,
			splunk_ack_enabled: destination.splunk_ack_enabled,
			syslog_facility: destination.syslog_facility,
			tls_verify_cert: destination.tls_verify_cert
		},
		zod(updateSiemDestinationSchema)
	);

	return { destination, form };
};

export const actions: Actions = {
	default: async ({ params, request, locals, fetch }) => {
		if (!locals.accessToken || !locals.tenantId) {
			redirect(302, '/login');
		}

		const form = await superValidate(request, zod(updateSiemDestinationSchema));
		if (!form.valid) {
			return fail(400, { form });
		}

		const body: UpdateSiemDestinationRequest = {};

		if (form.data.name !== undefined) body.name = form.data.name;
		if (form.data.endpoint_host !== undefined) body.endpoint_host = form.data.endpoint_host;
		if (form.data.endpoint_port !== undefined) body.endpoint_port = form.data.endpoint_port;
		if (form.data.export_format !== undefined) body.export_format = form.data.export_format;
		if (form.data.event_type_filter !== undefined)
			body.event_type_filter = form.data.event_type_filter;
		if (form.data.rate_limit_per_second !== undefined)
			body.rate_limit_per_second = form.data.rate_limit_per_second;
		if (form.data.queue_buffer_size !== undefined)
			body.queue_buffer_size = form.data.queue_buffer_size;
		if (form.data.circuit_breaker_threshold !== undefined)
			body.circuit_breaker_threshold = form.data.circuit_breaker_threshold;
		if (form.data.circuit_breaker_cooldown_secs !== undefined)
			body.circuit_breaker_cooldown_secs = form.data.circuit_breaker_cooldown_secs;
		if (form.data.enabled !== undefined) body.enabled = form.data.enabled;
		if (form.data.splunk_source !== undefined)
			body.splunk_source = form.data.splunk_source || undefined;
		if (form.data.splunk_sourcetype !== undefined)
			body.splunk_sourcetype = form.data.splunk_sourcetype || undefined;
		if (form.data.splunk_index !== undefined)
			body.splunk_index = form.data.splunk_index || undefined;
		if (form.data.splunk_ack_enabled !== undefined)
			body.splunk_ack_enabled = form.data.splunk_ack_enabled;
		if (form.data.syslog_facility !== undefined) body.syslog_facility = form.data.syslog_facility;
		if (form.data.tls_verify_cert !== undefined) body.tls_verify_cert = form.data.tls_verify_cert;
		if (form.data.auth_config_b64) body.auth_config_b64 = form.data.auth_config_b64;

		try {
			await updateSiemDestination(params.id, body, locals.accessToken, locals.tenantId, fetch);
			redirect(303, `/governance/siem/${params.id}`);
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
			return message(form, 'Failed to update destination', { status: 500 as ErrorStatus });
		}
	}
};
