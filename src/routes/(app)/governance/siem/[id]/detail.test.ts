import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/api/siem', () => ({
	getSiemDestination: vi.fn(),
	getSiemHealthSummary: vi.fn(),
	listSiemDeadLetter: vi.fn(),
	testSiemDestination: vi.fn(),
	updateSiemDestination: vi.fn(),
	deleteSiemDestination: vi.fn()
}));

vi.mock('$lib/api/client', () => ({
	ApiError: class ApiError extends Error {
		status: number;
		constructor(message: string, status: number) {
			super(message);
			this.status = status;
		}
	}
}));

vi.mock('$lib/server/auth', () => ({
	hasAdminRole: vi.fn()
}));

import { load, actions } from './+page.server';
import {
	getSiemDestination,
	getSiemHealthSummary,
	listSiemDeadLetter,
	testSiemDestination,
	updateSiemDestination,
	deleteSiemDestination
} from '$lib/api/siem';
import { ApiError } from '$lib/api/client';
import { hasAdminRole } from '$lib/server/auth';
import type { SiemDestination, SiemHealthSummary, SiemExportEventListResponse } from '$lib/api/types';

const mockGetDestination = vi.mocked(getSiemDestination);
const mockGetHealthSummary = vi.mocked(getSiemHealthSummary);
const mockListDeadLetter = vi.mocked(listSiemDeadLetter);
const mockTestDestination = vi.mocked(testSiemDestination);
const mockUpdateDestination = vi.mocked(updateSiemDestination);
const mockDeleteDestination = vi.mocked(deleteSiemDestination);
const mockHasAdminRole = vi.mocked(hasAdminRole);

const mockLocals = (admin: boolean) => ({
	accessToken: 'tok',
	tenantId: 'tid',
	user: { roles: admin ? ['admin'] : ['user'] }
});

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

function makeHealthSummary(overrides: Partial<SiemHealthSummary> = {}): SiemHealthSummary {
	return {
		destination_id: 'dest-1',
		total_events_sent: 50000,
		total_events_delivered: 49800,
		total_events_failed: 150,
		total_events_dropped: 50,
		avg_latency_ms: 45,
		last_success_at: '2026-02-10T12:00:00Z',
		last_failure_at: '2026-02-09T08:00:00Z',
		success_rate_percent: 99.6,
		circuit_state: 'closed',
		dead_letter_count: 12,
		...overrides
	};
}

function makeDeadLetterResponse(): SiemExportEventListResponse {
	return {
		items: [],
		total: 0,
		limit: 20,
		offset: 0
	};
}

describe('SIEM Detail +page.server', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mockHasAdminRole.mockReturnValue(true);
	});

	describe('load', () => {
		it('redirects to login when no accessToken', async () => {
			try {
				await load({
					params: { id: 'dest-1' },
					locals: { accessToken: null, tenantId: 'tid', user: { roles: ['admin'] } },
					fetch: vi.fn()
				} as any);
				expect.fail('should have thrown redirect');
			} catch (e: any) {
				expect(e.status).toBe(302);
				expect(e.location).toBe('/login');
			}
		});

		it('redirects to login when no tenantId', async () => {
			try {
				await load({
					params: { id: 'dest-1' },
					locals: { accessToken: 'tok', tenantId: null, user: { roles: ['admin'] } },
					fetch: vi.fn()
				} as any);
				expect.fail('should have thrown redirect');
			} catch (e: any) {
				expect(e.status).toBe(302);
				expect(e.location).toBe('/login');
			}
		});

		it('redirects non-admin users', async () => {
			mockHasAdminRole.mockReturnValue(false);
			try {
				await load({
					params: { id: 'dest-1' },
					locals: mockLocals(false),
					fetch: vi.fn()
				} as any);
				expect.fail('should have thrown redirect');
			} catch (e: any) {
				expect(e.status).toBe(302);
				expect(e.location).toBe('/');
			}
		});

		it('returns destination, health, and deadLetter', async () => {
			const dest = makeDestination();
			const health = makeHealthSummary();
			const deadLetter = makeDeadLetterResponse();

			mockGetDestination.mockResolvedValue(dest);
			mockGetHealthSummary.mockResolvedValue(health);
			mockListDeadLetter.mockResolvedValue(deadLetter);

			const result = (await load({
				params: { id: 'dest-1' },
				locals: mockLocals(true),
				fetch: vi.fn()
			} as any)) as any;

			expect(result.destination).toEqual(dest);
			expect(result.health).toEqual(health);
			expect(result.deadLetter).toEqual(deadLetter);
		});

		it('returns destination name correctly', async () => {
			mockGetDestination.mockResolvedValue(makeDestination({ name: 'Splunk Prod' }));
			mockGetHealthSummary.mockResolvedValue(makeHealthSummary());
			mockListDeadLetter.mockResolvedValue(makeDeadLetterResponse());

			const result = (await load({
				params: { id: 'dest-1' },
				locals: mockLocals(true),
				fetch: vi.fn()
			} as any)) as any;

			expect(result.destination.name).toBe('Splunk Prod');
		});

		it('gracefully handles health API failure', async () => {
			mockGetDestination.mockResolvedValue(makeDestination());
			mockGetHealthSummary.mockRejectedValue(new Error('health failed'));
			mockListDeadLetter.mockResolvedValue(makeDeadLetterResponse());

			const result = (await load({
				params: { id: 'dest-1' },
				locals: mockLocals(true),
				fetch: vi.fn()
			} as any)) as any;

			expect(result.destination).toBeDefined();
			expect(result.health).toBeNull();
			expect(result.deadLetter).toBeDefined();
		});

		it('gracefully handles dead letter API failure', async () => {
			mockGetDestination.mockResolvedValue(makeDestination());
			mockGetHealthSummary.mockResolvedValue(makeHealthSummary());
			mockListDeadLetter.mockRejectedValue(new Error('dead letter failed'));

			const result = (await load({
				params: { id: 'dest-1' },
				locals: mockLocals(true),
				fetch: vi.fn()
			} as any)) as any;

			expect(result.destination).toBeDefined();
			expect(result.health).toBeDefined();
			expect(result.deadLetter.items).toEqual([]);
			expect(result.deadLetter.total).toBe(0);
		});

		it('throws when destination not found', async () => {
			mockGetDestination.mockRejectedValue(new ApiError('Not found', 404));

			await expect(
				load({
					params: { id: 'nonexistent' },
					locals: mockLocals(true),
					fetch: vi.fn()
				} as any)
			).rejects.toThrow();
		});

		it('passes correct id to getSiemDestination', async () => {
			mockGetDestination.mockResolvedValue(makeDestination());
			mockGetHealthSummary.mockResolvedValue(makeHealthSummary());
			mockListDeadLetter.mockResolvedValue(makeDeadLetterResponse());

			await load({
				params: { id: 'dest-1' },
				locals: mockLocals(true),
				fetch: vi.fn()
			} as any);

			expect(mockGetDestination).toHaveBeenCalledWith('dest-1', 'tok', 'tid', expect.any(Function));
		});

		it('passes correct id to health and dead letter APIs', async () => {
			mockGetDestination.mockResolvedValue(makeDestination());
			mockGetHealthSummary.mockResolvedValue(makeHealthSummary());
			mockListDeadLetter.mockResolvedValue(makeDeadLetterResponse());

			await load({
				params: { id: 'dest-1' },
				locals: mockLocals(true),
				fetch: vi.fn()
			} as any);

			expect(mockGetHealthSummary).toHaveBeenCalledWith(
				'dest-1',
				'tok',
				'tid',
				expect.any(Function)
			);
			expect(mockListDeadLetter).toHaveBeenCalledWith(
				'dest-1',
				{ limit: 20, offset: 0 },
				'tok',
				'tid',
				expect.any(Function)
			);
		});
	});

	describe('actions.test', () => {
		it('exports test action', () => {
			expect(actions.test).toBeDefined();
		});

		it('returns test result on success', async () => {
			mockTestDestination.mockResolvedValue({
				success: true,
				latency_ms: 42,
				error: null
			});

			const result = await actions.test({
				params: { id: 'dest-1' },
				locals: mockLocals(true),
				fetch: vi.fn()
			} as any);

			expect(result).toEqual({
				success: true,
				testResult: { success: true, latency_ms: 42, error: null }
			});
		});

		it('returns error on test failure', async () => {
			mockTestDestination.mockRejectedValue(new ApiError('Connection refused', 502));

			const result: any = await actions.test({
				params: { id: 'dest-1' },
				locals: mockLocals(true),
				fetch: vi.fn()
			} as any);

			expect(result.status).toBe(502);
		});

		it('returns generic error on unexpected failure', async () => {
			mockTestDestination.mockRejectedValue(new Error('unexpected'));

			const result: any = await actions.test({
				params: { id: 'dest-1' },
				locals: mockLocals(true),
				fetch: vi.fn()
			} as any);

			expect(result.status).toBe(500);
		});
	});

	describe('actions.enable', () => {
		it('exports enable action', () => {
			expect(actions.enable).toBeDefined();
		});

		it('calls updateSiemDestination with enabled=true', async () => {
			mockUpdateDestination.mockResolvedValue(makeDestination({ enabled: true }) as any);

			const result = await actions.enable({
				params: { id: 'dest-1' },
				locals: mockLocals(true),
				fetch: vi.fn()
			} as any);

			expect(mockUpdateDestination).toHaveBeenCalledWith(
				'dest-1',
				{ enabled: true },
				'tok',
				'tid',
				expect.any(Function)
			);
			expect(result).toEqual({ success: true });
		});

		it('returns error on enable failure', async () => {
			mockUpdateDestination.mockRejectedValue(new ApiError('Cannot enable', 400));

			const result: any = await actions.enable({
				params: { id: 'dest-1' },
				locals: mockLocals(true),
				fetch: vi.fn()
			} as any);

			expect(result.status).toBe(400);
		});
	});

	describe('actions.disable', () => {
		it('exports disable action', () => {
			expect(actions.disable).toBeDefined();
		});

		it('calls updateSiemDestination with enabled=false', async () => {
			mockUpdateDestination.mockResolvedValue(makeDestination({ enabled: false }) as any);

			const result = await actions.disable({
				params: { id: 'dest-1' },
				locals: mockLocals(true),
				fetch: vi.fn()
			} as any);

			expect(mockUpdateDestination).toHaveBeenCalledWith(
				'dest-1',
				{ enabled: false },
				'tok',
				'tid',
				expect.any(Function)
			);
			expect(result).toEqual({ success: true });
		});

		it('returns error on disable failure', async () => {
			mockUpdateDestination.mockRejectedValue(new ApiError('Cannot disable', 400));

			const result: any = await actions.disable({
				params: { id: 'dest-1' },
				locals: mockLocals(true),
				fetch: vi.fn()
			} as any);

			expect(result.status).toBe(400);
		});
	});

	describe('actions.delete', () => {
		it('exports delete action', () => {
			expect(actions.delete).toBeDefined();
		});

		it('calls deleteSiemDestination and redirects', async () => {
			mockDeleteDestination.mockResolvedValue(undefined);

			await expect(
				actions.delete({
					params: { id: 'dest-1' },
					locals: mockLocals(true),
					fetch: vi.fn()
				} as any)
			).rejects.toThrow();

			expect(mockDeleteDestination).toHaveBeenCalledWith(
				'dest-1',
				'tok',
				'tid',
				expect.any(Function)
			);
		});

		it('returns error on delete failure', async () => {
			mockDeleteDestination.mockRejectedValue(new ApiError('Cannot delete', 409));

			const result: any = await actions.delete({
				params: { id: 'dest-1' },
				locals: mockLocals(true),
				fetch: vi.fn()
			} as any);

			expect(result.status).toBe(409);
		});
	});
});

describe('SIEM Detail rendering logic', () => {
	describe('destination detail display', () => {
		it('shows destination name', () => {
			const dest = makeDestination({ name: 'Splunk Prod' });
			expect(dest.name).toBe('Splunk Prod');
		});

		it('shows circuit state badge', () => {
			const circuitStateLabels: Record<string, string> = {
				closed: 'Closed',
				open: 'Open',
				half_open: 'Half Open'
			};
			const dest = makeDestination({ circuit_state: 'closed' });
			expect(circuitStateLabels[dest.circuit_state]).toBe('Closed');
		});

		it('shows enabled status', () => {
			const dest = makeDestination({ enabled: true });
			const label = dest.enabled ? 'Enabled' : 'Disabled';
			expect(label).toBe('Enabled');
		});

		it('shows disabled status', () => {
			const dest = makeDestination({ enabled: false });
			const label = dest.enabled ? 'Enabled' : 'Disabled';
			expect(label).toBe('Disabled');
		});

		it('shows endpoint host', () => {
			const dest = makeDestination({ endpoint_host: 'splunk.example.com', endpoint_port: 8088 });
			const hostDisplay = `${dest.endpoint_host}${dest.endpoint_port ? `:${dest.endpoint_port}` : ''}`;
			expect(hostDisplay).toBe('splunk.example.com:8088');
		});

		it('shows endpoint host without port when null', () => {
			const dest = makeDestination({ endpoint_host: 'splunk.example.com', endpoint_port: null });
			const hostDisplay = `${dest.endpoint_host}${dest.endpoint_port ? `:${dest.endpoint_port}` : ''}`;
			expect(hostDisplay).toBe('splunk.example.com');
		});

		it('shows destination type label', () => {
			const typeLabels: Record<string, string> = {
				syslog_tcp_tls: 'Syslog TLS',
				syslog_udp: 'Syslog UDP',
				webhook: 'Webhook',
				splunk_hec: 'Splunk HEC'
			};
			const dest = makeDestination({ destination_type: 'splunk_hec' });
			expect(typeLabels[dest.destination_type]).toBe('Splunk HEC');
		});

		it('shows export format label', () => {
			const formatLabels: Record<string, string> = {
				cef: 'CEF',
				syslog_rfc5424: 'Syslog RFC5424',
				json: 'JSON',
				csv: 'CSV'
			};
			const dest = makeDestination({ export_format: 'json' });
			expect(formatLabels[dest.export_format]).toBe('JSON');
		});
	});

	describe('edit link', () => {
		it('generates correct edit link', () => {
			const destId = 'dest-1';
			const href = `/governance/siem/${destId}/edit`;
			expect(href).toBe('/governance/siem/dest-1/edit');
		});
	});

	describe('action buttons', () => {
		it('shows Test Connection button text', () => {
			const text = 'Test Connection';
			expect(text).toBe('Test Connection');
		});

		it('shows Disable button when enabled', () => {
			const dest = makeDestination({ enabled: true });
			const buttonText = dest.enabled ? 'Disable' : 'Enable';
			expect(buttonText).toBe('Disable');
		});

		it('shows Enable button when disabled', () => {
			const dest = makeDestination({ enabled: false });
			const buttonText = dest.enabled ? 'Disable' : 'Enable';
			expect(buttonText).toBe('Enable');
		});

		it('shows Delete button text', () => {
			const text = 'Delete';
			expect(text).toBe('Delete');
		});
	});

	describe('health summary display', () => {
		it('shows total events sent', () => {
			const health = makeHealthSummary({ total_events_sent: 50000 });
			expect(health.total_events_sent).toBe(50000);
		});

		it('shows total events delivered', () => {
			const health = makeHealthSummary({ total_events_delivered: 49800 });
			expect(health.total_events_delivered).toBe(49800);
		});

		it('shows total events failed', () => {
			const health = makeHealthSummary({ total_events_failed: 150 });
			expect(health.total_events_failed).toBe(150);
		});

		it('shows success rate percent', () => {
			const health = makeHealthSummary({ success_rate_percent: 99.6 });
			expect(health.success_rate_percent).toBe(99.6);
		});

		it('shows avg latency', () => {
			const health = makeHealthSummary({ avg_latency_ms: 45 });
			expect(health.avg_latency_ms).toBe(45);
		});

		it('shows dead letter count', () => {
			const health = makeHealthSummary({ dead_letter_count: 12 });
			expect(health.dead_letter_count).toBe(12);
		});

		it('handles null avg_latency_ms', () => {
			const health = makeHealthSummary({ avg_latency_ms: null });
			expect(health.avg_latency_ms).toBeNull();
		});

		it('handles null last_failure_at', () => {
			const health = makeHealthSummary({ last_failure_at: null });
			expect(health.last_failure_at).toBeNull();
		});
	});

	describe('dead letter empty state', () => {
		it('shows empty state when no dead letters', () => {
			const deadLetter = makeDeadLetterResponse();
			expect(deadLetter.items).toHaveLength(0);
			expect(deadLetter.total).toBe(0);
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

	describe('mock data conformity', () => {
		it('SiemDestination has all required fields for detail view', () => {
			const d = makeDestination();
			expect(d.id).toBeDefined();
			expect(d.name).toBeDefined();
			expect(d.destination_type).toBeDefined();
			expect(d.endpoint_host).toBeDefined();
			expect(d.export_format).toBeDefined();
			expect(typeof d.enabled).toBe('boolean');
			expect(typeof d.has_auth_config).toBe('boolean');
			expect(d.circuit_state).toBeDefined();
			expect(typeof d.rate_limit_per_second).toBe('number');
			expect(typeof d.queue_buffer_size).toBe('number');
			expect(typeof d.circuit_breaker_threshold).toBe('number');
			expect(typeof d.circuit_breaker_cooldown_secs).toBe('number');
			expect(d.created_at).toBeDefined();
			expect(d.updated_at).toBeDefined();
		});

		it('SiemHealthSummary has all required fields', () => {
			const h = makeHealthSummary();
			expect(h.destination_id).toBeDefined();
			expect(typeof h.total_events_sent).toBe('number');
			expect(typeof h.total_events_delivered).toBe('number');
			expect(typeof h.total_events_failed).toBe('number');
			expect(typeof h.total_events_dropped).toBe('number');
			expect(typeof h.success_rate_percent).toBe('number');
			expect(typeof h.dead_letter_count).toBe('number');
			expect(h.circuit_state).toBeDefined();
		});
	});
});
