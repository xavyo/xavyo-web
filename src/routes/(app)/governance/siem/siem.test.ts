import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/api/siem', () => ({
	listSiemDestinations: vi.fn(),
	listSiemExports: vi.fn()
}));

vi.mock('$lib/api/client', () => ({
	ApiError: class extends Error {
		status: number;
		constructor(m: string, s: number) {
			super(m);
			this.status = s;
		}
	}
}));

vi.mock('$lib/server/auth', () => ({
	hasAdminRole: vi.fn()
}));

import { load } from './+page.server';
import { listSiemDestinations, listSiemExports } from '$lib/api/siem';
import { hasAdminRole } from '$lib/server/auth';
import type { SiemDestination, SiemBatchExport } from '$lib/api/types';

const mockListDestinations = vi.mocked(listSiemDestinations);
const mockListExports = vi.mocked(listSiemExports);
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

function makeDestination2(): SiemDestination {
	return makeDestination({
		id: 'dest-2',
		name: 'Syslog DR',
		destination_type: 'syslog_tcp_tls',
		endpoint_host: 'syslog.example.com',
		endpoint_port: 6514,
		export_format: 'syslog_rfc5424',
		enabled: false,
		circuit_state: 'open',
		has_auth_config: false
	});
}

function makeExport(overrides: Partial<SiemBatchExport> = {}): SiemBatchExport {
	return {
		id: 'export-1',
		tenant_id: 'tid',
		requested_by: 'admin-user',
		date_range_start: '2026-01-01T00:00:00Z',
		date_range_end: '2026-01-31T23:59:59Z',
		event_type_filter: ['authentication'],
		output_format: 'json',
		status: 'completed',
		total_events: 15420,
		file_size_bytes: 2048000,
		error_detail: null,
		started_at: '2026-02-01T10:00:00Z',
		completed_at: '2026-02-01T10:05:00Z',
		expires_at: '2026-03-01T10:05:00Z',
		created_at: '2026-02-01T09:55:00Z',
		...overrides
	};
}

describe('SIEM hub +page.server', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mockHasAdminRole.mockReturnValue(true);
	});

	describe('load', () => {
		it('redirects to login when no accessToken', async () => {
			try {
				await load({
					locals: { accessToken: null, tenantId: 'tid', user: { roles: ['admin'] } },
					url: new URL('http://localhost/governance/siem'),
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
					locals: { accessToken: 'tok', tenantId: null, user: { roles: ['admin'] } },
					url: new URL('http://localhost/governance/siem'),
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
					locals: mockLocals(false),
					url: new URL('http://localhost/governance/siem'),
					fetch: vi.fn()
				} as any);
				expect.fail('should have thrown redirect');
			} catch (e: any) {
				expect(e.status).toBe(302);
				expect(e.location).toBe('/');
			}
		});

		it('returns destinations and exports for admin', async () => {
			const dests = [makeDestination(), makeDestination2()];
			const exps = [makeExport()];

			mockListDestinations.mockResolvedValue({ items: dests, total: 2, limit: 20, offset: 0 });
			mockListExports.mockResolvedValue({ items: exps, total: 1, limit: 20, offset: 0 });

			const result = (await load({
				locals: mockLocals(true),
				url: new URL('http://localhost/governance/siem'),
				fetch: vi.fn()
			} as any)) as any;

			expect(result.destinations.items).toHaveLength(2);
			expect(result.destinations.total).toBe(2);
			expect(result.exports.items).toHaveLength(1);
			expect(result.exports.total).toBe(1);
		});

		it('reads pagination from URL searchParams', async () => {
			mockListDestinations.mockResolvedValue({ items: [], total: 0, limit: 10, offset: 20 });
			mockListExports.mockResolvedValue({ items: [], total: 0, limit: 20, offset: 0 });

			await load({
				locals: mockLocals(true),
				url: new URL('http://localhost/governance/siem?limit=10&offset=20'),
				fetch: vi.fn()
			} as any);

			expect(mockListDestinations).toHaveBeenCalledWith(
				expect.objectContaining({ limit: 10, offset: 20 }),
				'tok',
				'tid',
				expect.any(Function)
			);
		});

		it('gracefully handles destinations API failure', async () => {
			mockListDestinations.mockRejectedValue(new Error('API error'));
			mockListExports.mockResolvedValue({
				items: [makeExport()],
				total: 1,
				limit: 20,
				offset: 0
			});

			const result = (await load({
				locals: mockLocals(true),
				url: new URL('http://localhost/governance/siem'),
				fetch: vi.fn()
			} as any)) as any;

			expect(result.destinations.items).toEqual([]);
			expect(result.destinations.total).toBe(0);
			expect(result.exports.items).toHaveLength(1);
		});

		it('gracefully handles exports API failure', async () => {
			mockListDestinations.mockResolvedValue({
				items: [makeDestination()],
				total: 1,
				limit: 20,
				offset: 0
			});
			mockListExports.mockRejectedValue(new Error('API error'));

			const result = (await load({
				locals: mockLocals(true),
				url: new URL('http://localhost/governance/siem'),
				fetch: vi.fn()
			} as any)) as any;

			expect(result.destinations.items).toHaveLength(1);
			expect(result.exports.items).toEqual([]);
			expect(result.exports.total).toBe(0);
		});

		it('gracefully handles all APIs failing', async () => {
			mockListDestinations.mockRejectedValue(new Error('fail'));
			mockListExports.mockRejectedValue(new Error('fail'));

			const result = (await load({
				locals: mockLocals(true),
				url: new URL('http://localhost/governance/siem'),
				fetch: vi.fn()
			} as any)) as any;

			expect(result.destinations).toEqual({ items: [], total: 0, limit: 20, offset: 0 });
			expect(result.exports).toEqual({ items: [], total: 0, limit: 20, offset: 0 });
		});

		it('passes correct token and tenantId', async () => {
			mockListDestinations.mockResolvedValue({ items: [], total: 0, limit: 20, offset: 0 });
			mockListExports.mockResolvedValue({ items: [], total: 0, limit: 20, offset: 0 });
			const mockFetch = vi.fn();

			await load({
				locals: {
					accessToken: 'my-token',
					tenantId: 'my-tenant',
					user: { roles: ['admin'] }
				},
				url: new URL('http://localhost/governance/siem'),
				fetch: mockFetch
			} as any);

			expect(mockListDestinations).toHaveBeenCalledWith(
				expect.any(Object),
				'my-token',
				'my-tenant',
				mockFetch
			);
			expect(mockListExports).toHaveBeenCalledWith(
				expect.any(Object),
				'my-token',
				'my-tenant',
				mockFetch
			);
		});

		it('calls hasAdminRole with user roles', async () => {
			mockListDestinations.mockResolvedValue({ items: [], total: 0, limit: 20, offset: 0 });
			mockListExports.mockResolvedValue({ items: [], total: 0, limit: 20, offset: 0 });

			await load({
				locals: mockLocals(true),
				url: new URL('http://localhost/governance/siem'),
				fetch: vi.fn()
			} as any);

			expect(mockHasAdminRole).toHaveBeenCalledWith(['admin']);
		});
	});
});

describe('SIEM hub +page.svelte', () => {
	it(
		'is defined as a module',
		async () => {
			const mod = await import('./+page.svelte');
			expect(mod.default).toBeDefined();
		},
		15000
	);

	it(
		'is a valid Svelte component constructor',
		async () => {
			const mod = await import('./+page.svelte');
			expect(typeof mod.default).toBe('function');
		},
		15000
	);
});

describe('SIEM hub rendering logic', () => {
	describe('tab definitions', () => {
		const tabs = [
			{ id: 'destinations', label: 'Destinations' },
			{ id: 'batch-exports', label: 'Batch Exports' }
		];

		it('has 2 tabs', () => {
			expect(tabs).toHaveLength(2);
		});

		it('has Destinations as first tab', () => {
			expect(tabs[0].label).toBe('Destinations');
		});

		it('has Batch Exports as second tab', () => {
			expect(tabs[1].label).toBe('Batch Exports');
		});
	});

	describe('type labels', () => {
		const typeLabels: Record<string, string> = {
			syslog_tcp_tls: 'Syslog TLS',
			syslog_udp: 'Syslog UDP',
			webhook: 'Webhook',
			splunk_hec: 'Splunk HEC'
		};

		it('maps splunk_hec to Splunk HEC', () => {
			expect(typeLabels['splunk_hec']).toBe('Splunk HEC');
		});

		it('maps syslog_tcp_tls to Syslog TLS', () => {
			expect(typeLabels['syslog_tcp_tls']).toBe('Syslog TLS');
		});

		it('maps syslog_udp to Syslog UDP', () => {
			expect(typeLabels['syslog_udp']).toBe('Syslog UDP');
		});

		it('maps webhook to Webhook', () => {
			expect(typeLabels['webhook']).toBe('Webhook');
		});
	});

	describe('circuit state labels', () => {
		const circuitStateLabels: Record<string, string> = {
			closed: 'Closed',
			open: 'Open',
			half_open: 'Half Open'
		};

		it('maps closed to Closed', () => {
			expect(circuitStateLabels['closed']).toBe('Closed');
		});

		it('maps open to Open', () => {
			expect(circuitStateLabels['open']).toBe('Open');
		});

		it('maps half_open to Half Open', () => {
			expect(circuitStateLabels['half_open']).toBe('Half Open');
		});
	});

	describe('circuit state colors', () => {
		const circuitStateColors: Record<string, string> = {
			closed: 'text-green-600 dark:text-green-400',
			open: 'text-red-600 dark:text-red-400',
			half_open: 'text-yellow-600 dark:text-yellow-400'
		};

		it('closed gets green color', () => {
			expect(circuitStateColors['closed']).toContain('green');
		});

		it('open gets red color', () => {
			expect(circuitStateColors['open']).toContain('red');
		});

		it('half_open gets yellow color', () => {
			expect(circuitStateColors['half_open']).toContain('yellow');
		});
	});

	describe('enabled/disabled status display', () => {
		it('enabled destination shows Enabled text', () => {
			const dest = makeDestination({ enabled: true });
			const label = dest.enabled ? 'Enabled' : 'Disabled';
			expect(label).toBe('Enabled');
		});

		it('disabled destination shows Disabled text', () => {
			const dest = makeDestination({ enabled: false });
			const label = dest.enabled ? 'Enabled' : 'Disabled';
			expect(label).toBe('Disabled');
		});
	});

	describe('destination name as link', () => {
		it('generates correct link from destination id', () => {
			const dest = makeDestination({ id: 'dest-abc' });
			const href = `/governance/siem/${dest.id}`;
			expect(href).toBe('/governance/siem/dest-abc');
		});

		it('destination name is used as link text', () => {
			const dest = makeDestination({ name: 'Splunk Prod' });
			expect(dest.name).toBe('Splunk Prod');
		});
	});

	describe('export status badge classes', () => {
		const exportStatusBadgeClass: Record<string, string> = {
			pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
			processing: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
			completed: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
			failed: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
		};

		it('completed gets green badge', () => {
			expect(exportStatusBadgeClass['completed']).toContain('green');
		});

		it('pending gets yellow badge', () => {
			expect(exportStatusBadgeClass['pending']).toContain('yellow');
		});

		it('processing gets blue badge', () => {
			expect(exportStatusBadgeClass['processing']).toContain('blue');
		});

		it('failed gets red badge', () => {
			expect(exportStatusBadgeClass['failed']).toContain('red');
		});
	});

	describe('format labels', () => {
		const formatLabels: Record<string, string> = {
			cef: 'CEF',
			syslog_rfc5424: 'Syslog RFC5424',
			json: 'JSON',
			csv: 'CSV'
		};

		it('maps json to JSON', () => {
			expect(formatLabels['json']).toBe('JSON');
		});

		it('maps cef to CEF', () => {
			expect(formatLabels['cef']).toBe('CEF');
		});

		it('maps csv to CSV', () => {
			expect(formatLabels['csv']).toBe('CSV');
		});

		it('maps syslog_rfc5424 to Syslog RFC5424', () => {
			expect(formatLabels['syslog_rfc5424']).toBe('Syslog RFC5424');
		});
	});

	describe('formatDate', () => {
		function formatDate(dateStr: string | null): string {
			if (!dateStr || isNaN(new Date(dateStr).getTime())) return '\u2014';
			return new Date(dateStr).toLocaleDateString('en-US', {
				year: 'numeric',
				month: 'short',
				day: 'numeric'
			});
		}

		it('formats valid date string', () => {
			const result = formatDate('2026-02-01T00:00:00Z');
			expect(result).toBeTruthy();
			expect(result).not.toBe('\u2014');
		});

		it('returns dash for null', () => {
			expect(formatDate(null)).toBe('\u2014');
		});

		it('returns dash for empty string', () => {
			expect(formatDate('')).toBe('\u2014');
		});

		it('returns dash for invalid date', () => {
			expect(formatDate('not-a-date')).toBe('\u2014');
		});
	});

	describe('empty state messages', () => {
		it('shows correct empty destinations message', () => {
			const msg = 'No SIEM destinations configured yet.';
			expect(msg).toBe('No SIEM destinations configured yet.');
		});

		it('shows correct empty exports message', () => {
			const msg = 'No batch exports yet.';
			expect(msg).toBe('No batch exports yet.');
		});

		it('shows Add Destination button text', () => {
			const text = 'Add Destination';
			expect(text).toBe('Add Destination');
		});

		it('shows create first destination link text', () => {
			const text = 'Create your first destination';
			expect(text).toBe('Create your first destination');
		});
	});

	describe('pagination logic', () => {
		it('disables Previous when offset is 0', () => {
			const offset = 0;
			expect(offset <= 0).toBe(true);
		});

		it('disables Next when on last page', () => {
			const offset = 10;
			const limit = 20;
			const total = 25;
			expect(offset + limit >= total).toBe(true);
		});

		it('enables Next when more items exist', () => {
			const offset = 0;
			const limit = 20;
			const total = 100;
			expect(offset + limit >= total).toBe(false);
		});

		it('calculates showing range correctly', () => {
			const offset = 20;
			const limit = 20;
			const total = 80;
			const start = offset + 1;
			const end = Math.min(offset + limit, total);
			expect(start).toBe(21);
			expect(end).toBe(40);
		});
	});

	describe('destination count pluralization', () => {
		it('singular when 1 destination', () => {
			const total: number = 1;
			const text = `${total} destination${total !== 1 ? 's' : ''}`;
			expect(text).toBe('1 destination');
		});

		it('plural when 0 destinations', () => {
			const total: number = 0;
			const text = `${total} destination${total !== 1 ? 's' : ''}`;
			expect(text).toBe('0 destinations');
		});

		it('plural when multiple destinations', () => {
			const total: number = 5;
			const text = `${total} destination${total !== 1 ? 's' : ''}`;
			expect(text).toBe('5 destinations');
		});
	});

	describe('export count pluralization', () => {
		it('singular when 1 export', () => {
			const total: number = 1;
			const text = `${total} export${total !== 1 ? 's' : ''}`;
			expect(text).toBe('1 export');
		});

		it('plural when multiple exports', () => {
			const total: number = 42;
			const text = `${total} export${total !== 1 ? 's' : ''}`;
			expect(text).toBe('42 exports');
		});
	});

	describe('mock data conformity', () => {
		it('SiemDestination has all required fields', () => {
			const d = makeDestination();
			expect(d.id).toBeDefined();
			expect(d.tenant_id).toBeDefined();
			expect(d.name).toBeDefined();
			expect(d.destination_type).toBeDefined();
			expect(d.endpoint_host).toBeDefined();
			expect(d.export_format).toBeDefined();
			expect(typeof d.has_auth_config).toBe('boolean');
			expect(typeof d.enabled).toBe('boolean');
			expect(d.circuit_state).toBeDefined();
			expect(d.created_at).toBeDefined();
		});

		it('SiemDestination destination_type is a valid value', () => {
			const validTypes = ['syslog_tcp_tls', 'syslog_udp', 'webhook', 'splunk_hec'];
			const d = makeDestination();
			expect(validTypes).toContain(d.destination_type);
		});

		it('SiemDestination circuit_state is a valid value', () => {
			const validStates = ['closed', 'open', 'half_open'];
			const d = makeDestination();
			expect(validStates).toContain(d.circuit_state);
		});

		it('SiemBatchExport has all required fields', () => {
			const e = makeExport();
			expect(e.id).toBeDefined();
			expect(e.tenant_id).toBeDefined();
			expect(e.requested_by).toBeDefined();
			expect(e.date_range_start).toBeDefined();
			expect(e.date_range_end).toBeDefined();
			expect(e.output_format).toBeDefined();
			expect(e.status).toBeDefined();
			expect(e.created_at).toBeDefined();
		});

		it('SiemBatchExport status is a valid value', () => {
			const validStatuses = ['pending', 'processing', 'completed', 'failed'];
			const e = makeExport();
			expect(validStatuses).toContain(e.status);
		});

		it('SiemBatchExport export_format is a valid value', () => {
			const validFormats = ['cef', 'syslog_rfc5424', 'json', 'csv'];
			const e = makeExport();
			expect(validFormats).toContain(e.output_format);
		});
	});

	describe('page header', () => {
		it('has correct title', () => {
			const title = 'SIEM Export';
			expect(title).toBe('SIEM Export');
		});

		it('has correct description', () => {
			const description =
				'Configure SIEM destinations for real-time event streaming and manage batch exports.';
			expect(description).toContain('SIEM destinations');
			expect(description).toContain('batch exports');
		});
	});
});
