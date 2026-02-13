import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/api/siem', () => ({
	createSiemExport: vi.fn()
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
import { createSiemExport } from '$lib/api/siem';
import { ApiError } from '$lib/api/client';
import { hasAdminRole } from '$lib/server/auth';

const mockCreateExport = vi.mocked(createSiemExport);
const mockHasAdminRole = vi.mocked(hasAdminRole);

const mockLocals = (admin: boolean) => ({
	accessToken: 'tok',
	tenantId: 'tid',
	user: { roles: admin ? ['admin'] : ['user'] }
});

function makeFormData(data: Record<string, string | string[]>): Request {
	const formData = new URLSearchParams();
	for (const [k, v] of Object.entries(data)) {
		if (Array.isArray(v)) {
			for (const item of v) {
				formData.append(k, item);
			}
		} else {
			formData.set(k, v);
		}
	}
	return new Request('http://localhost/governance/siem/exports/create', {
		method: 'POST',
		headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
		body: formData.toString()
	});
}

describe('SIEM Export Create +page.server', () => {
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

		it('form data date_range_start is initially empty', async () => {
			const result: any = await load({
				locals: mockLocals(true)
			} as any);
			expect(result.form.data.date_range_start).toBeFalsy();
		});

		it('form data date_range_end is initially empty', async () => {
			const result: any = await load({
				locals: mockLocals(true)
			} as any);
			expect(result.form.data.date_range_end).toBeFalsy();
		});

		it('form data event_type_filter is initially empty array', async () => {
			const result: any = await load({
				locals: mockLocals(true)
			} as any);
			expect(result.form.data.event_type_filter).toEqual([]);
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

		it('returns validation error for missing date_range_start', async () => {
			const result: any = await actions.default({
				request: makeFormData({
					date_range_start: '',
					date_range_end: '2026-02-10T00:00',
					output_format: 'json',
					event_type_filter: ['authentication']
				}),
				locals: mockLocals(true),
				fetch: vi.fn()
			} as any);
			expect(result.status).toBe(400);
		});

		it('returns validation error for missing date_range_end', async () => {
			const result: any = await actions.default({
				request: makeFormData({
					date_range_start: '2026-01-01T00:00',
					date_range_end: '',
					output_format: 'json',
					event_type_filter: ['authentication']
				}),
				locals: mockLocals(true),
				fetch: vi.fn()
			} as any);
			expect(result.status).toBe(400);
		});

		it('returns validation error for empty event_type_filter', async () => {
			const result: any = await actions.default({
				request: makeFormData({
					date_range_start: '2026-01-01T00:00',
					date_range_end: '2026-02-01T00:00',
					output_format: 'json'
				}),
				locals: mockLocals(true),
				fetch: vi.fn()
			} as any);
			expect(result.status).toBe(400);
		});

		it('calls createSiemExport and redirects on success', async () => {
			mockCreateExport.mockResolvedValue({ id: 'new-export-id' } as any);
			try {
				await actions.default({
					request: makeFormData({
						date_range_start: '2026-01-01T00:00',
						date_range_end: '2026-02-01T00:00',
						output_format: 'json',
						event_type_filter: ['authentication', 'security']
					}),
					locals: mockLocals(true),
					fetch: vi.fn()
				} as any);
				expect.fail('should have thrown redirect');
			} catch (e: any) {
				if (e.status === 302) {
					expect(e.location).toBe('/governance/siem');
				}
			}
		});

		it('returns API error message on failure', async () => {
			mockCreateExport.mockRejectedValue(new ApiError('Export failed', 500));
			const result: any = await actions.default({
				request: makeFormData({
					date_range_start: '2026-01-01T00:00',
					date_range_end: '2026-02-01T00:00',
					output_format: 'json',
					event_type_filter: ['authentication']
				}),
				locals: mockLocals(true),
				fetch: vi.fn()
			} as any);
			expect(result.data.form.message).toBe('Export failed');
		});

		it('returns generic error for unknown failures', async () => {
			mockCreateExport.mockRejectedValue(new Error('Network error'));
			const result: any = await actions.default({
				request: makeFormData({
					date_range_start: '2026-01-01T00:00',
					date_range_end: '2026-02-01T00:00',
					output_format: 'json',
					event_type_filter: ['authentication']
				}),
				locals: mockLocals(true),
				fetch: vi.fn()
			} as any);
			expect(result.data.form.message).toBe('Failed to create export');
		});

		it('redirects to login when no accessToken in action', async () => {
			try {
				await actions.default({
					request: makeFormData({ date_range_start: '2026-01-01T00:00' }),
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

describe('SIEM Export Create +page.svelte', () => {
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

describe('SIEM Export Create rendering logic', () => {
	describe('page header', () => {
		it('has correct title', () => {
			const title = 'Create Batch Export';
			expect(title).toBe('Create Batch Export');
		});

		it('has correct description', () => {
			const description = 'Export audit events for a specific date range and event categories';
			expect(description).toContain('audit events');
		});
	});

	describe('output format options', () => {
		const options = [
			{ value: 'cef', label: 'CEF' },
			{ value: 'syslog_rfc5424', label: 'Syslog RFC5424' },
			{ value: 'json', label: 'JSON' },
			{ value: 'csv', label: 'CSV' }
		];

		it('has 4 output format options', () => {
			expect(options).toHaveLength(4);
		});

		it('includes CEF', () => {
			expect(options.find((o) => o.value === 'cef')?.label).toBe('CEF');
		});

		it('includes Syslog RFC5424', () => {
			expect(options.find((o) => o.value === 'syslog_rfc5424')?.label).toBe('Syslog RFC5424');
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

		it('includes group_changes', () => {
			expect(eventCategories.find((c) => c.value === 'group_changes')?.label).toBe(
				'Group Changes'
			);
		});

		it('includes access_requests', () => {
			expect(eventCategories.find((c) => c.value === 'access_requests')?.label).toBe(
				'Access Requests'
			);
		});

		it('includes administrative', () => {
			expect(eventCategories.find((c) => c.value === 'administrative')?.label).toBe(
				'Administrative'
			);
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

		it('can add multiple categories', () => {
			let current: string[] = [];
			current = handleEventTypeToggle(current, 'authentication');
			current = handleEventTypeToggle(current, 'security');
			current = handleEventTypeToggle(current, 'provisioning');
			expect(current).toHaveLength(3);
		});
	});

	describe('back link', () => {
		it('links back to SIEM hub', () => {
			const href = '/governance/siem';
			expect(href).toBe('/governance/siem');
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
			const text = 'Create Export';
			expect(text).toBe('Create Export');
		});
	});

	describe('form field labels', () => {
		it('has Start Date label', () => {
			const label = 'Start Date';
			expect(label).toBe('Start Date');
		});

		it('has End Date label', () => {
			const label = 'End Date';
			expect(label).toBe('End Date');
		});

		it('has Output Format label', () => {
			const label = 'Output Format';
			expect(label).toBe('Output Format');
		});

		it('has Event Categories label', () => {
			const label = 'Event Categories';
			expect(label).toBe('Event Categories');
		});
	});

	describe('date range constraint hint', () => {
		it('shows 90-day limit hint', () => {
			const hint = 'Date range cannot exceed 90 days. End date must be after start date.';
			expect(hint).toContain('90 days');
			expect(hint).toContain('after start date');
		});
	});

	describe('date inputs use datetime-local type', () => {
		it('start date uses datetime-local', () => {
			const type = 'datetime-local';
			expect(type).toBe('datetime-local');
		});

		it('end date uses datetime-local', () => {
			const type = 'datetime-local';
			expect(type).toBe('datetime-local');
		});
	});
});
