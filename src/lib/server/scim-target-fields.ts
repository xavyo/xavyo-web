import { JsonObjectError, parseBoundedInteger } from '$lib/utils/json-record';
import type { ScimTargetDeprovisioningStrategy } from '$lib/api/types';

export type ScimTargetAdvertisedFields = {
	deprovisioning_strategy?: ScimTargetDeprovisioningStrategy;
	tls_verify?: boolean;
	rate_limit_per_minute?: number;
	request_timeout_secs?: number;
	max_retries?: number;
};

/** Copy advertised SCIM target delivery/TLS fields from a BFF JSON body. */
export function applyScimTargetAdvertisedFields(
	body: Record<string, unknown>,
	data: ScimTargetAdvertisedFields
): void {
	if (body.deprovisioning_strategy !== undefined) {
		if (body.deprovisioning_strategy !== 'deactivate' && body.deprovisioning_strategy !== 'delete') {
			throw new JsonObjectError('deprovisioning_strategy must be deactivate or delete');
		}
		data.deprovisioning_strategy = body.deprovisioning_strategy;
	}
	if (body.tls_verify !== undefined) {
		if (typeof body.tls_verify !== 'boolean') {
			throw new JsonObjectError('tls_verify must be a boolean');
		}
		data.tls_verify = body.tls_verify;
	}
	if (body.rate_limit_per_minute !== undefined) {
		data.rate_limit_per_minute = parseBoundedInteger(
			body.rate_limit_per_minute,
			1,
			1_000_000,
			'rate_limit_per_minute'
		);
	}
	if (body.request_timeout_secs !== undefined) {
		data.request_timeout_secs = parseBoundedInteger(
			body.request_timeout_secs,
			1,
			3600,
			'request_timeout_secs'
		);
	}
	if (body.max_retries !== undefined) {
		data.max_retries = parseBoundedInteger(body.max_retries, 0, 100, 'max_retries');
	}
}
