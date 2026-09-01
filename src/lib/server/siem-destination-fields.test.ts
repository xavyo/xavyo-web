import { describe, it, expect } from 'vitest';
import {
	applySiemDestinationAdvertisedFields,
	type SiemDestinationAdvertisedFields
} from './siem-destination-fields';

describe('applySiemDestinationAdvertisedFields', () => {
	it('copies advertised destination config fields', () => {
		const data: SiemDestinationAdvertisedFields = {};
		applySiemDestinationAdvertisedFields(
			{
				auth_config_b64: 'YWI=',
				rate_limit_per_second: 250,
				queue_buffer_size: 5000,
				circuit_breaker_threshold: 7,
				circuit_breaker_cooldown_secs: 90,
				splunk_source: 'xavyo',
				splunk_sourcetype: '_json',
				splunk_index: 'main',
				splunk_ack_enabled: true,
				syslog_facility: 14,
				tls_verify_cert: false
			},
			data
		);
		expect(data).toEqual({
			auth_config_b64: 'YWI=',
			rate_limit_per_second: 250,
			queue_buffer_size: 5000,
			circuit_breaker_threshold: 7,
			circuit_breaker_cooldown_secs: 90,
			splunk_source: 'xavyo',
			splunk_sourcetype: '_json',
			splunk_index: 'main',
			splunk_ack_enabled: true,
			syslog_facility: 14,
			tls_verify_cert: false
		});
	});

	it('accepts numeric-string integers', () => {
		const data: SiemDestinationAdvertisedFields = {};
		applySiemDestinationAdvertisedFields(
			{ rate_limit_per_second: '1000', syslog_facility: '10' },
			data
		);
		expect(data.rate_limit_per_second).toBe(1000);
		expect(data.syslog_facility).toBe(10);
	});

	it('rejects NaN rate_limit_per_second', () => {
		expect(() =>
			applySiemDestinationAdvertisedFields({ rate_limit_per_second: Number.NaN }, {})
		).toThrow();
	});

	it('rejects syslog_facility outside 0-23', () => {
		expect(() => applySiemDestinationAdvertisedFields({ syslog_facility: 24 }, {})).toThrow();
	});
});
