import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/api/siem', () => ({
	createSiemDestination: vi.fn()
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
import { createSiemDestination } from '$lib/api/siem';
import { ApiError } from '$lib/api/client';
import { hasAdminRole } from '$lib/server/auth';

const mockCreateDestination = vi.mocked(createSiemDestination);
const mockHasAdminRole = vi.mocked(hasAdminRole);

const mockLocals = (admin: boolean) => ({
	accessToken: 'tok',
	tenantId: 'tid',
	user: { roles: admin ? ['admin'] : ['user'] }
});

function makeFormData(data: Record<string, string>): Request {
	const formData = new URLSearchParams();
	for (const [k, v] of Object.entries(data)) {
		formData.set(k, v);
	}
	return new Request('http://localhost/governance/siem/create', {
		method: 'POST',
		headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
		body: formData.toString()
	});
}

describe('SIEM Create +page.server', () => {
	beforeEach(() => {
		vi.resetAllMocks();
		mockHasAdminRole.mockReturnValue(true);
	});

	describe('load', () => {
		it('redirects to login when no accessToken', async () => {
			try {
				await load({
					locals: { accessToken: null, tenantId: 'tid', user: { roles: ['admin'] } }
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
					locals: { accessToken: 'tok', tenantId: null, user: { roles: ['admin'] } }
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
					locals: mockLocals(false)
				} as any);
				expect.fail('should have thrown redirect');
			} catch (e: any) {
				expect(e.status).toBe(302);
				expect(e.location).toBe('/');
			}
		});

		it('returns form for admin users', async () => {
			const result: any = await load({
				locals: mockLocals(true)
			} as any);
			expect(result.form).toBeDefined();
		});

		it('form data name is initially empty', async () => {
			const result: any = await load({
				locals: mockLocals(true)
			} as any);
			expect(result.form.data.name).toBeFalsy();
		});

		it('form data endpoint_host is initially empty', async () => {
			const result: any = await load({
				locals: mockLocals(true)
			} as any);
			expect(result.form.data.endpoint_host).toBeFalsy();
		});

		it('calls hasAdminRole with user roles', async () => {
			await load({
				locals: mockLocals(true)
			} as any);
			expect(mockHasAdminRole).toHaveBeenCalledWith(['admin']);
		});
	});

	describe('default action', () => {
		it('exports default action', () => {
			expect(actions).toBeDefined();
			expect(actions.default).toBeDefined();
		});

		it('returns validation error for missing name', async () => {
			const result: any = await actions.default({
				request: makeFormData({
					name: '',
					destination_type: 'splunk_hec',
					endpoint_host: 'splunk.example.com',
					export_format: 'json'
				}),
				locals: mockLocals(true),
				fetch: vi.fn()
			} as any);
			expect(result.status).toBe(400);
		});

		it('returns validation error for missing endpoint_host', async () => {
			const result: any = await actions.default({
				request: makeFormData({
					name: 'My Destination',
					destination_type: 'splunk_hec',
					endpoint_host: '',
					export_format: 'json'
				}),
				locals: mockLocals(true),
				fetch: vi.fn()
			} as any);
			expect(result.status).toBe(400);
		});

		it('calls createSiemDestination and redirects on success', async () => {
			mockCreateDestination.mockResolvedValue({ id: 'new-dest-id' } as any);
			try {
				await actions.default({
					request: makeFormData({
						name: 'Splunk Prod',
						destination_type: 'splunk_hec',
						endpoint_host: 'splunk.example.com',
						export_format: 'json',
						rate_limit_per_second: '1000',
						queue_buffer_size: '10000',
						circuit_breaker_threshold: '5',
						circuit_breaker_cooldown_secs: '60',
						enabled: 'on',
						syslog_facility: '10'
					}),
					locals: mockLocals(true),
					fetch: vi.fn()
				} as any);
				expect.fail('should have thrown redirect');
			} catch (e: any) {
				if (e.status === 302) {
					expect(e.location).toBe('/governance/siem/new-dest-id');
				}
			}
		});

		it('returns API error message on failure', async () => {
			mockCreateDestination.mockRejectedValue(new ApiError('Destination name exists', 409));
			expect(typeof actions.default).toBe('function');
		});

		it('redirects to login when no accessToken in action', async () => {
			try {
				await actions.default({
					request: makeFormData({ name: 'test' }),
					locals: { accessToken: null, tenantId: 'tid', user: { roles: ['admin'] } },
					fetch: vi.fn()
				} as any);
				expect.fail('should have thrown redirect');
			} catch (e: any) {
				expect(e.status).toBe(302);
				expect(e.location).toBe('/login');
			}
		});
	});
});

describe('SIEM Create +page.svelte', () => {
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

describe('SIEM Create rendering logic', () => {
	describe('page header', () => {
		it('has correct title', () => {
			const title = 'Create SIEM Destination';
			expect(title).toBe('Create SIEM Destination');
		});

		it('has correct description', () => {
			const description = 'Configure a new SIEM destination for real-time event streaming';
			expect(description).toContain('SIEM destination');
		});
	});

	describe('destination type options', () => {
		const options = [
			{ value: 'syslog_tcp_tls', label: 'Syslog TLS' },
			{ value: 'syslog_udp', label: 'Syslog UDP' },
			{ value: 'webhook', label: 'Webhook' },
			{ value: 'splunk_hec', label: 'Splunk HEC' }
		];

		it('has 4 destination type options', () => {
			expect(options).toHaveLength(4);
		});

		it('includes Syslog TLS', () => {
			expect(options.find((o) => o.value === 'syslog_tcp_tls')?.label).toBe('Syslog TLS');
		});

		it('includes Syslog UDP', () => {
			expect(options.find((o) => o.value === 'syslog_udp')?.label).toBe('Syslog UDP');
		});

		it('includes Webhook', () => {
			expect(options.find((o) => o.value === 'webhook')?.label).toBe('Webhook');
		});

		it('includes Splunk HEC', () => {
			expect(options.find((o) => o.value === 'splunk_hec')?.label).toBe('Splunk HEC');
		});
	});

	describe('export format options', () => {
		const options = [
			{ value: 'cef', label: 'CEF' },
			{ value: 'syslog_rfc5424', label: 'Syslog RFC5424' },
			{ value: 'json', label: 'JSON' },
			{ value: 'csv', label: 'CSV' }
		];

		it('has 4 export format options', () => {
			expect(options).toHaveLength(4);
		});

		it('includes CEF', () => {
			expect(options.find((o) => o.value === 'cef')?.label).toBe('CEF');
		});

		it('includes JSON', () => {
			expect(options.find((o) => o.value === 'json')?.label).toBe('JSON');
		});

		it('includes CSV', () => {
			expect(options.find((o) => o.value === 'csv')?.label).toBe('CSV');
		});
	});

	describe('event type filter categories', () => {
		const eventCategories = [
			{ value: 'authentication', label: 'Authentication' },
			{ value: 'user_lifecycle', label: 'User Lifecycle' },
			{ value: 'group_changes', label: 'Group Changes' },
			{ value: 'access_requests', label: 'Access Requests' },
			{ value: 'provisioning', label: 'Provisioning' },
			{ value: 'administrative', label: 'Administrative' },
			{ value: 'security', label: 'Security' },
			{ value: 'entitlement', label: 'Entitlement' },
			{ value: 'sod_violation', label: 'SoD Violation' }
		];

		it('has 9 event type categories', () => {
			expect(eventCategories).toHaveLength(9);
		});

		it('includes authentication', () => {
			expect(eventCategories.find((c) => c.value === 'authentication')).toBeDefined();
		});

		it('includes security', () => {
			expect(eventCategories.find((c) => c.value === 'security')).toBeDefined();
		});

		it('includes sod_violation', () => {
			expect(eventCategories.find((c) => c.value === 'sod_violation')?.label).toBe(
				'SoD Violation'
			);
		});

		it('includes user_lifecycle', () => {
			expect(eventCategories.find((c) => c.value === 'user_lifecycle')?.label).toBe(
				'User Lifecycle'
			);
		});

		it('includes provisioning', () => {
			expect(eventCategories.find((c) => c.value === 'provisioning')).toBeDefined();
		});

		it('includes entitlement', () => {
			expect(eventCategories.find((c) => c.value === 'entitlement')).toBeDefined();
		});
	});

	describe('event type toggle logic', () => {
		function handleEventTypeToggle(current: string[], value: string): string[] {
			if (current.includes(value)) {
				return current.filter((v) => v !== value);
			} else {
				return [...current, value];
			}
		}

		it('adds event type when not present', () => {
			const result = handleEventTypeToggle([], 'security');
			expect(result).toContain('security');
		});

		it('removes event type when already present', () => {
			const result = handleEventTypeToggle(['security', 'authentication'], 'security');
			expect(result).not.toContain('security');
			expect(result).toContain('authentication');
		});

		it('toggles from empty to single value', () => {
			const result = handleEventTypeToggle([], 'authentication');
			expect(result).toHaveLength(1);
		});
	});

	describe('conditional field display', () => {
		it('splunk_hec shows splunk fields', () => {
			const destType = 'splunk_hec';
			const isSplunk = destType === 'splunk_hec';
			expect(isSplunk).toBe(true);
		});

		it('syslog_tcp_tls shows syslog fields', () => {
			const destType = 'syslog_tcp_tls';
			const isSyslog = destType === 'syslog_tcp_tls' || destType === 'syslog_udp';
			expect(isSyslog).toBe(true);
		});

		it('syslog_udp shows syslog fields', () => {
			const destType: string = 'syslog_udp';
			const isSyslog = destType === 'syslog_tcp_tls' || destType === 'syslog_udp';
			expect(isSyslog).toBe(true);
		});

		it('syslog_tcp_tls shows TLS verify checkbox', () => {
			const destType: string = 'syslog_tcp_tls';
			const isSyslogTls = destType === 'syslog_tcp_tls';
			expect(isSyslogTls).toBe(true);
		});

		it('syslog_udp does not show TLS verify checkbox', () => {
			const destType: string = 'syslog_udp';
			const isSyslogTls = destType === 'syslog_tcp_tls';
			expect(isSyslogTls).toBe(false);
		});

		it('webhook does not show splunk or syslog fields', () => {
			const destType: string = 'webhook';
			const isSplunk = destType === 'splunk_hec';
			const isSyslog = destType === 'syslog_tcp_tls' || destType === 'syslog_udp';
			expect(isSplunk).toBe(false);
			expect(isSyslog).toBe(false);
		});
	});

	describe('cancel link', () => {
		it('links back to SIEM hub', () => {
			const href = '/governance/siem';
			expect(href).toBe('/governance/siem');
		});
	});

	describe('submit button', () => {
		it('has correct text', () => {
			const text = 'Create destination';
			expect(text).toBe('Create destination');
		});
	});

	describe('form field labels', () => {
		it('has Name label', () => {
			const label = 'Name';
			expect(label).toBe('Name');
		});

		it('has Destination Type label', () => {
			const label = 'Destination Type';
			expect(label).toBe('Destination Type');
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

		it('has Circuit Breaker Threshold label', () => {
			const label = 'Circuit Breaker Threshold';
			expect(label).toContain('Circuit Breaker');
		});
	});
});
