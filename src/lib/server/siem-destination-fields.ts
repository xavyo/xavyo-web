import { JsonObjectError, parseBoundedInteger } from '$lib/utils/json-record';

export type SiemDestinationAdvertisedFields = {
	auth_config_b64?: string;
	rate_limit_per_second?: number;
	queue_buffer_size?: number;
	circuit_breaker_threshold?: number;
	circuit_breaker_cooldown_secs?: number;
	splunk_source?: string;
	splunk_sourcetype?: string;
	splunk_index?: string;
	splunk_ack_enabled?: boolean;
	syslog_facility?: number;
	tls_verify_cert?: boolean;
};

const I32_MAX = 2_147_483_647;

function optionalString(value: unknown, field: string): string {
	if (typeof value !== 'string') {
		throw new JsonObjectError(`${field} must be a string`);
	}
	return value;
}

function optionalBoolean(value: unknown, field: string): boolean {
	if (typeof value !== 'boolean') {
		throw new JsonObjectError(`${field} must be a boolean`);
	}
	return value;
}

/** Copy advertised SIEM destination config fields from a BFF JSON body. */
export function applySiemDestinationAdvertisedFields(
	body: Record<string, unknown>,
	data: SiemDestinationAdvertisedFields
): void {
	if (body.auth_config_b64 !== undefined) {
		data.auth_config_b64 = optionalString(body.auth_config_b64, 'auth_config_b64');
	}
	if (body.rate_limit_per_second !== undefined) {
		data.rate_limit_per_second = parseBoundedInteger(
			body.rate_limit_per_second,
			1,
			I32_MAX,
			'rate_limit_per_second'
		);
	}
	if (body.queue_buffer_size !== undefined) {
		data.queue_buffer_size = parseBoundedInteger(
			body.queue_buffer_size,
			100,
			I32_MAX,
			'queue_buffer_size'
		);
	}
	if (body.circuit_breaker_threshold !== undefined) {
		data.circuit_breaker_threshold = parseBoundedInteger(
			body.circuit_breaker_threshold,
			1,
			I32_MAX,
			'circuit_breaker_threshold'
		);
	}
	if (body.circuit_breaker_cooldown_secs !== undefined) {
		data.circuit_breaker_cooldown_secs = parseBoundedInteger(
			body.circuit_breaker_cooldown_secs,
			1,
			I32_MAX,
			'circuit_breaker_cooldown_secs'
		);
	}
	if (body.splunk_source !== undefined) {
		data.splunk_source = optionalString(body.splunk_source, 'splunk_source');
	}
	if (body.splunk_sourcetype !== undefined) {
		data.splunk_sourcetype = optionalString(body.splunk_sourcetype, 'splunk_sourcetype');
	}
	if (body.splunk_index !== undefined) {
		data.splunk_index = optionalString(body.splunk_index, 'splunk_index');
	}
	if (body.splunk_ack_enabled !== undefined) {
		data.splunk_ack_enabled = optionalBoolean(body.splunk_ack_enabled, 'splunk_ack_enabled');
	}
	if (body.syslog_facility !== undefined) {
		data.syslog_facility = parseBoundedInteger(body.syslog_facility, 0, 23, 'syslog_facility');
	}
	if (body.tls_verify_cert !== undefined) {
		data.tls_verify_cert = optionalBoolean(body.tls_verify_cert, 'tls_verify_cert');
	}
}
