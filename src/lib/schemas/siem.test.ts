import { describe, it, expect } from 'vitest';
import { createSiemDestinationSchema, updateSiemDestinationSchema, createSiemExportSchema } from './siem';

describe('createSiemDestinationSchema', () => {
	const validBase = {
		name: 'Production Splunk',
		destination_type: 'splunk_hec',
		endpoint_host: 'splunk.example.com',
		export_format: 'json'
	};

	it('accepts valid splunk_hec destination', () => {
		const result = createSiemDestinationSchema.safeParse({
			...validBase,
			endpoint_port: 8088,
			splunk_source: 'xavyo',
			splunk_sourcetype: 'idp_events',
			splunk_index: 'security'
		});
		expect(result.success).toBe(true);
	});

	it('accepts valid syslog_tcp_tls destination', () => {
		const result = createSiemDestinationSchema.safeParse({
			...validBase,
			destination_type: 'syslog_tcp_tls',
			endpoint_port: 6514,
			export_format: 'cef',
			syslog_facility: 4,
			tls_verify_cert: true
		});
		expect(result.success).toBe(true);
	});

	it('accepts valid syslog_udp destination', () => {
		const result = createSiemDestinationSchema.safeParse({
			...validBase,
			destination_type: 'syslog_udp',
			endpoint_port: 514,
			export_format: 'syslog_rfc5424'
		});
		expect(result.success).toBe(true);
	});

	it('accepts valid webhook destination without port', () => {
		const result = createSiemDestinationSchema.safeParse({
			...validBase,
			destination_type: 'webhook',
			export_format: 'json'
		});
		expect(result.success).toBe(true);
	});

	it('accepts event_type_filter with valid categories', () => {
		const result = createSiemDestinationSchema.safeParse({
			...validBase,
			event_type_filter: ['authentication', 'security', 'sod_violation']
		});
		expect(result.success).toBe(true);
	});

	it('rejects missing name', () => {
		const { name, ...rest } = validBase;
		const result = createSiemDestinationSchema.safeParse(rest);
		expect(result.success).toBe(false);
	});

	it('rejects name longer than 255 characters', () => {
		const result = createSiemDestinationSchema.safeParse({
			...validBase,
			name: 'x'.repeat(256)
		});
		expect(result.success).toBe(false);
	});

	it('rejects invalid destination_type', () => {
		const result = createSiemDestinationSchema.safeParse({
			...validBase,
			destination_type: 'invalid_type'
		});
		expect(result.success).toBe(false);
	});

	it('rejects missing endpoint_host', () => {
		const { endpoint_host, ...rest } = validBase;
		const result = createSiemDestinationSchema.safeParse(rest);
		expect(result.success).toBe(false);
	});

	it('rejects invalid export_format', () => {
		const result = createSiemDestinationSchema.safeParse({
			...validBase,
			export_format: 'xml'
		});
		expect(result.success).toBe(false);
	});

	it('rejects rate_limit_per_second less than 1', () => {
		const result = createSiemDestinationSchema.safeParse({
			...validBase,
			rate_limit_per_second: 0
		});
		expect(result.success).toBe(false);
	});

	it('rejects queue_buffer_size less than 100', () => {
		const result = createSiemDestinationSchema.safeParse({
			...validBase,
			queue_buffer_size: 50
		});
		expect(result.success).toBe(false);
	});

	it('rejects syslog_facility greater than 23', () => {
		const result = createSiemDestinationSchema.safeParse({
			...validBase,
			syslog_facility: 24
		});
		expect(result.success).toBe(false);
	});

	it('rejects syslog_facility less than 0', () => {
		const result = createSiemDestinationSchema.safeParse({
			...validBase,
			syslog_facility: -1
		});
		expect(result.success).toBe(false);
	});

	it('rejects endpoint_port greater than 65535', () => {
		const result = createSiemDestinationSchema.safeParse({
			...validBase,
			endpoint_port: 70000
		});
		expect(result.success).toBe(false);
	});

	it('applies defaults for optional numeric fields', () => {
		const result = createSiemDestinationSchema.safeParse(validBase);
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.rate_limit_per_second).toBe(1000);
			expect(result.data.queue_buffer_size).toBe(10000);
			expect(result.data.circuit_breaker_threshold).toBe(5);
			expect(result.data.circuit_breaker_cooldown_secs).toBe(60);
			expect(result.data.enabled).toBe(true);
			expect(result.data.splunk_ack_enabled).toBe(false);
			expect(result.data.syslog_facility).toBe(10);
			expect(result.data.tls_verify_cert).toBe(true);
		}
	});

	it('accepts auth_config_b64 string', () => {
		const result = createSiemDestinationSchema.safeParse({
			...validBase,
			auth_config_b64: 'eyJ0eXBlIjoiYmVhcmVyIn0='
		});
		expect(result.success).toBe(true);
	});

	it('rejects invalid event category', () => {
		const result = createSiemDestinationSchema.safeParse({
			...validBase,
			event_type_filter: ['authentication', 'invalid_category']
		});
		expect(result.success).toBe(false);
	});
});

describe('updateSiemDestinationSchema', () => {
	it('accepts empty object (no changes)', () => {
		const result = updateSiemDestinationSchema.safeParse({});
		expect(result.success).toBe(true);
	});

	it('accepts partial update with name only', () => {
		const result = updateSiemDestinationSchema.safeParse({ name: 'Updated Name' });
		expect(result.success).toBe(true);
	});

	it('accepts partial update with enabled toggle', () => {
		const result = updateSiemDestinationSchema.safeParse({ enabled: false });
		expect(result.success).toBe(true);
	});

	it('accepts partial update with multiple fields', () => {
		const result = updateSiemDestinationSchema.safeParse({
			name: 'New Name',
			endpoint_host: 'new-host.example.com',
			rate_limit_per_second: 500
		});
		expect(result.success).toBe(true);
	});

	it('rejects name longer than 255 chars', () => {
		const result = updateSiemDestinationSchema.safeParse({ name: 'x'.repeat(256) });
		expect(result.success).toBe(false);
	});

	it('rejects invalid export_format', () => {
		const result = updateSiemDestinationSchema.safeParse({ export_format: 'xml' });
		expect(result.success).toBe(false);
	});
});

describe('createSiemExportSchema', () => {
	const validExport = {
		date_range_start: '2026-01-01T00:00:00Z',
		date_range_end: '2026-01-15T00:00:00Z',
		event_type_filter: ['authentication', 'security'],
		output_format: 'json'
	};

	it('accepts valid export request', () => {
		const result = createSiemExportSchema.safeParse(validExport);
		expect(result.success).toBe(true);
	});

	it('accepts all export formats', () => {
		for (const format of ['cef', 'syslog_rfc5424', 'json', 'csv']) {
			const result = createSiemExportSchema.safeParse({ ...validExport, output_format: format });
			expect(result.success).toBe(true);
		}
	});

	it('rejects end date before start date', () => {
		const result = createSiemExportSchema.safeParse({
			...validExport,
			date_range_start: '2026-02-01T00:00:00Z',
			date_range_end: '2026-01-01T00:00:00Z'
		});
		expect(result.success).toBe(false);
	});

	it('rejects date range exceeding 90 days', () => {
		const result = createSiemExportSchema.safeParse({
			...validExport,
			date_range_start: '2026-01-01T00:00:00Z',
			date_range_end: '2026-06-01T00:00:00Z'
		});
		expect(result.success).toBe(false);
	});

	it('rejects empty event_type_filter', () => {
		const result = createSiemExportSchema.safeParse({
			...validExport,
			event_type_filter: []
		});
		expect(result.success).toBe(false);
	});

	it('rejects missing start date', () => {
		const { date_range_start, ...rest } = validExport;
		const result = createSiemExportSchema.safeParse(rest);
		expect(result.success).toBe(false);
	});

	it('rejects missing end date', () => {
		const { date_range_end, ...rest } = validExport;
		const result = createSiemExportSchema.safeParse(rest);
		expect(result.success).toBe(false);
	});

	it('rejects invalid output_format', () => {
		const result = createSiemExportSchema.safeParse({
			...validExport,
			output_format: 'xml'
		});
		expect(result.success).toBe(false);
	});

	it('accepts exactly 90 day range', () => {
		const result = createSiemExportSchema.safeParse({
			...validExport,
			date_range_start: '2026-01-01T00:00:00Z',
			date_range_end: '2026-04-01T00:00:00Z'
		});
		expect(result.success).toBe(true);
	});

	it('accepts all 9 event categories', () => {
		const result = createSiemExportSchema.safeParse({
			...validExport,
			event_type_filter: [
				'authentication', 'user_lifecycle', 'group_changes',
				'access_requests', 'provisioning', 'administrative',
				'security', 'entitlement', 'sod_violation'
			]
		});
		expect(result.success).toBe(true);
	});
});
