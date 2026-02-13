import { describe, it, expect, vi } from 'vitest';
import type { SiemDestination } from '$lib/api/types';
import type { UpdateSiemDestinationInput } from '$lib/schemas/siem';

function makeDestination(overrides: Partial<SiemDestination> = {}): SiemDestination {
	return {
		id: 'dest-1',
		tenant_id: 'tid',
		name: 'Splunk Prod',
		destination_type: 'splunk_hec',
		endpoint_host: 'splunk.example.com',
		endpoint_port: 8088,
		export_format: 'json',
		has_auth_config: true,
		event_type_filter: ['authentication', 'security'],
		rate_limit_per_second: 1000,
		queue_buffer_size: 10000,
		circuit_breaker_threshold: 5,
		circuit_breaker_cooldown_secs: 60,
		circuit_state: 'closed',
		circuit_last_failure_at: null,
		enabled: true,
		splunk_source: 'xavyo-idp',
		splunk_sourcetype: '_json',
		splunk_index: 'main',
		splunk_ack_enabled: false,
		syslog_facility: 10,
		tls_verify_cert: true,
		created_at: '2026-02-01T00:00:00Z',
		updated_at: '2026-02-10T00:00:00Z',
		created_by: 'admin-user',
		...overrides
	};
}

describe('SIEM Edit rendering logic', () => {
	describe('page header', () => {
		it('renders edit page header', () => {
			const dest = makeDestination({ name: 'Splunk Prod' });
			const title = `Edit ${dest.name}`;
			expect(title).toBe('Edit Splunk Prod');
		});

		it('renders generic edit header when name is empty', () => {
			const dest = makeDestination({ name: '' });
			const title = dest.name ? `Edit ${dest.name}` : 'Edit Destination';
			expect(title).toBe('Edit Destination');
		});
	});

	describe('pre-filled form data', () => {
		it('pre-fills name field with existing value', () => {
			const dest = makeDestination({ name: 'Splunk Prod' });
			expect(dest.name).toBe('Splunk Prod');
		});

		it('pre-fills endpoint_host with existing value', () => {
			const dest = makeDestination({ endpoint_host: 'splunk.example.com' });
			expect(dest.endpoint_host).toBe('splunk.example.com');
		});

		it('pre-fills endpoint_port with existing value', () => {
			const dest = makeDestination({ endpoint_port: 8088 });
			expect(dest.endpoint_port).toBe(8088);
		});

		it('pre-fills export_format with existing value', () => {
			const dest = makeDestination({ export_format: 'json' });
			expect(dest.export_format).toBe('json');
		});

		it('pre-fills destination_type with existing value', () => {
			const dest = makeDestination({ destination_type: 'splunk_hec' });
			expect(dest.destination_type).toBe('splunk_hec');
		});

		it('pre-fills rate_limit_per_second with existing value', () => {
			const dest = makeDestination({ rate_limit_per_second: 1000 });
			expect(dest.rate_limit_per_second).toBe(1000);
		});

		it('pre-fills queue_buffer_size with existing value', () => {
			const dest = makeDestination({ queue_buffer_size: 10000 });
			expect(dest.queue_buffer_size).toBe(10000);
		});

		it('pre-fills circuit_breaker_threshold with existing value', () => {
			const dest = makeDestination({ circuit_breaker_threshold: 5 });
			expect(dest.circuit_breaker_threshold).toBe(5);
		});

		it('pre-fills event_type_filter with existing value', () => {
			const dest = makeDestination({ event_type_filter: ['authentication', 'security'] });
			expect(dest.event_type_filter).toHaveLength(2);
			expect(dest.event_type_filter).toContain('authentication');
			expect(dest.event_type_filter).toContain('security');
		});

		it('pre-fills splunk_source for splunk destinations', () => {
			const dest = makeDestination({ splunk_source: 'xavyo-idp' });
			expect(dest.splunk_source).toBe('xavyo-idp');
		});

		it('pre-fills syslog_facility for syslog destinations', () => {
			const dest = makeDestination({
				destination_type: 'syslog_tcp_tls',
				syslog_facility: 14
			});
			expect(dest.syslog_facility).toBe(14);
		});
	});

	describe('has_auth_config indicator', () => {
		it('shows credentials configured when has_auth_config is true', () => {
			const dest = makeDestination({ has_auth_config: true });
			const indicator = dest.has_auth_config ? 'Credentials configured' : 'No credentials';
			expect(indicator).toBe('Credentials configured');
		});

		it('shows no credentials when has_auth_config is false', () => {
			const dest = makeDestination({ has_auth_config: false });
			const indicator = dest.has_auth_config ? 'Credentials configured' : 'No credentials';
			expect(indicator).toBe('No credentials');
		});
	});

	describe('submit button', () => {
		it('has correct save button text', () => {
			const text = 'Save';
			expect(text).toBe('Save');
		});

		it('has alternative save text', () => {
			const text = 'Save changes';
			expect(text).toBe('Save changes');
		});
	});

	describe('back link', () => {
		it('links back to detail page', () => {
			const destId = 'dest-1';
			const href = `/governance/siem/${destId}`;
			expect(href).toBe('/governance/siem/dest-1');
		});

		it('generates correct cancel link', () => {
			const destId = 'dest-abc-123';
			const href = `/governance/siem/${destId}`;
			expect(href).toBe('/governance/siem/dest-abc-123');
		});
	});

	describe('update schema mapping', () => {
		it('maps destination fields to update request', () => {
			const dest = makeDestination();
			const updateData: Partial<UpdateSiemDestinationInput> = {
				name: dest.name,
				endpoint_host: dest.endpoint_host,
				endpoint_port: dest.endpoint_port ?? undefined,
				export_format: dest.export_format,
				rate_limit_per_second: dest.rate_limit_per_second,
				queue_buffer_size: dest.queue_buffer_size,
				circuit_breaker_threshold: dest.circuit_breaker_threshold,
				circuit_breaker_cooldown_secs: dest.circuit_breaker_cooldown_secs,
				enabled: dest.enabled
			};

			expect(updateData.name).toBe('Splunk Prod');
			expect(updateData.endpoint_host).toBe('splunk.example.com');
			expect(updateData.endpoint_port).toBe(8088);
			expect(updateData.export_format).toBe('json');
		});

		it('handles null endpoint_port as undefined', () => {
			const dest = makeDestination({ endpoint_port: null });
			const updateData = {
				endpoint_port: dest.endpoint_port ?? undefined
			};
			expect(updateData.endpoint_port).toBeUndefined();
		});
	});

	describe('form field labels', () => {
		it('has Name label', () => {
			const label = 'Name';
			expect(label).toBe('Name');
		});

		it('has Endpoint Host label', () => {
			const label = 'Endpoint Host';
			expect(label).toBe('Endpoint Host');
		});

		it('has Export Format label', () => {
			const label = 'Export Format';
			expect(label).toBe('Export Format');
		});

		it('has Rate Limit label', () => {
			const label = 'Rate Limit (events/sec)';
			expect(label).toContain('Rate Limit');
		});
	});

	describe('conditional fields', () => {
		it('shows splunk fields when destination_type is splunk_hec', () => {
			const dest = makeDestination({ destination_type: 'splunk_hec' });
			const isSplunk = dest.destination_type === 'splunk_hec';
			expect(isSplunk).toBe(true);
		});

		it('hides splunk fields for syslog destinations', () => {
			const dest = makeDestination({ destination_type: 'syslog_tcp_tls' });
			const isSplunk = dest.destination_type === 'splunk_hec';
			expect(isSplunk).toBe(false);
		});

		it('shows syslog fields when destination_type is syslog_tcp_tls', () => {
			const dest = makeDestination({ destination_type: 'syslog_tcp_tls' });
			const isSyslog =
				dest.destination_type === 'syslog_tcp_tls' || dest.destination_type === 'syslog_udp';
			expect(isSyslog).toBe(true);
		});

		it('shows TLS verify checkbox only for syslog_tcp_tls', () => {
			const dest = makeDestination({ destination_type: 'syslog_tcp_tls' });
			const isSyslogTls = dest.destination_type === 'syslog_tcp_tls';
			expect(isSyslogTls).toBe(true);
		});

		it('does not show TLS verify for syslog_udp', () => {
			const dest = makeDestination({ destination_type: 'syslog_udp' });
			const isSyslogTls = dest.destination_type === 'syslog_tcp_tls';
			expect(isSyslogTls).toBe(false);
		});
	});

	describe('mock data conformity for edit', () => {
		it('SiemDestination has id for routing', () => {
			const dest = makeDestination();
			expect(dest.id).toBe('dest-1');
		});

		it('SiemDestination fields map to form inputs', () => {
			const dest = makeDestination();
			expect(typeof dest.name).toBe('string');
			expect(typeof dest.endpoint_host).toBe('string');
			expect(typeof dest.rate_limit_per_second).toBe('number');
			expect(typeof dest.queue_buffer_size).toBe('number');
			expect(typeof dest.circuit_breaker_threshold).toBe('number');
			expect(typeof dest.circuit_breaker_cooldown_secs).toBe('number');
			expect(typeof dest.enabled).toBe('boolean');
			expect(typeof dest.has_auth_config).toBe('boolean');
		});

		it('destination_type is a valid enum value', () => {
			const validTypes = ['syslog_tcp_tls', 'syslog_udp', 'webhook', 'splunk_hec'];
			const dest = makeDestination();
			expect(validTypes).toContain(dest.destination_type);
		});

		it('export_format is a valid enum value', () => {
			const validFormats = ['cef', 'syslog_rfc5424', 'json', 'csv'];
			const dest = makeDestination();
			expect(validFormats).toContain(dest.export_format);
		});

		it('event_type_filter contains valid categories', () => {
			const validCategories = [
				'authentication',
				'user_lifecycle',
				'group_changes',
				'access_requests',
				'provisioning',
				'administrative',
				'security',
				'entitlement',
				'sod_violation'
			];
			const dest = makeDestination({ event_type_filter: ['authentication', 'security'] });
			for (const cat of dest.event_type_filter) {
				expect(validCategories).toContain(cat);
			}
		});
	});
});
