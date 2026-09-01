import { describe, it, expect } from 'vitest';
import { applyScimTargetAdvertisedFields, type ScimTargetAdvertisedFields } from './scim-target-fields';

describe('applyScimTargetAdvertisedFields', () => {
	it('copies advertised delivery and TLS fields', () => {
		const data: ScimTargetAdvertisedFields = {};
		applyScimTargetAdvertisedFields(
			{
				deprovisioning_strategy: 'delete',
				tls_verify: false,
				rate_limit_per_minute: 120,
				request_timeout_secs: 45,
				max_retries: 3
			},
			data
		);
		expect(data).toEqual({
			deprovisioning_strategy: 'delete',
			tls_verify: false,
			rate_limit_per_minute: 120,
			request_timeout_secs: 45,
			max_retries: 3
		});
	});

	it('accepts numeric-string integers', () => {
		const data: ScimTargetAdvertisedFields = {};
		applyScimTargetAdvertisedFields({ rate_limit_per_minute: '60', max_retries: '2' }, data);
		expect(data.rate_limit_per_minute).toBe(60);
		expect(data.max_retries).toBe(2);
	});

	it('rejects NaN rate_limit_per_minute', () => {
		expect(() =>
			applyScimTargetAdvertisedFields({ rate_limit_per_minute: Number.NaN }, {})
		).toThrow();
	});

	it('rejects invalid deprovisioning_strategy', () => {
		expect(() =>
			applyScimTargetAdvertisedFields({ deprovisioning_strategy: 'disable' }, {})
		).toThrow();
	});
});
