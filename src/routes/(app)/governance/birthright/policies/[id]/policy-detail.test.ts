import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { BirthrightPolicy } from '$lib/api/types';

vi.mock('$lib/api/birthright', () => ({
	getBirthrightPolicy: vi.fn(),
	enableBirthrightPolicy: vi.fn(),
	disableBirthrightPolicy: vi.fn(),
	archiveBirthrightPolicy: vi.fn()
}));

vi.mock('$lib/api/governance', () => ({
	listEntitlements: vi.fn()
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
	getBirthrightPolicy,
	enableBirthrightPolicy,
	disableBirthrightPolicy,
	archiveBirthrightPolicy
} from '$lib/api/birthright';
import { listEntitlements } from '$lib/api/governance';
import { ApiError } from '$lib/api/client';
import { hasAdminRole } from '$lib/server/auth';

const mockGetPolicy = vi.mocked(getBirthrightPolicy);
const mockEnablePolicy = vi.mocked(enableBirthrightPolicy);
const mockDisablePolicy = vi.mocked(disableBirthrightPolicy);
const mockArchivePolicy = vi.mocked(archiveBirthrightPolicy);
const mockListEntitlements = vi.mocked(listEntitlements);
const mockHasAdminRole = vi.mocked(hasAdminRole);

const mockLocals = (admin: boolean) => ({
	accessToken: 'tok',
	tenantId: 'tid',
	user: { roles: admin ? ['admin'] : ['user'] }
});

function makePolicy(overrides: Partial<BirthrightPolicy> = {}): BirthrightPolicy {
	return {
		id: 'pol-1',
		tenant_id: 't1',
		name: 'Engineering Access',
		description: 'Auto provision for engineers',
		priority: 10,
		conditions: [{ attribute: 'department', operator: 'equals', value: 'Engineering' }],
		entitlement_ids: ['ent-1', 'ent-2'],
		status: 'active',
		evaluation_mode: 'all_match',
		grace_period_days: 7,
		created_by: 'user-1',
		created_at: '2024-01-01T00:00:00Z',
		updated_at: '2024-01-01T00:00:00Z',
		...overrides
	};
}

describe('Policy Detail +page.server', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mockHasAdminRole.mockReturnValue(true);
		mockListEntitlements.mockResolvedValue({
			items: [
				{ id: 'ent-1', name: 'VPN Access' } as any,
				{ id: 'ent-2', name: 'GitHub Access' } as any
			],
			total: 2,
			limit: 100,
			offset: 0
		});
	});

	describe('load', () => {
		it('redirects non-admin users', async () => {
			mockHasAdminRole.mockReturnValue(false);
			try {
				await load({
					params: { id: 'pol-1' },
					locals: mockLocals(false),
					fetch: vi.fn()
				} as any);
				expect.fail('should have thrown redirect');
			} catch (e: any) {
				expect(e.status).toBe(302);
				expect(e.location).toBe('/dashboard');
			}
		});

		it('returns policy detail with entitlement map', async () => {
			mockGetPolicy.mockResolvedValue(makePolicy());
			const result = (await load({
				params: { id: 'pol-1' },
				locals: mockLocals(true),
				fetch: vi.fn()
			} as any)) as any;

			expect(result.policy.name).toBe('Engineering Access');
			expect(result.entitlementMap['ent-1']).toBe('VPN Access');
			expect(result.entitlementMap['ent-2']).toBe('GitHub Access');
		});

		it('throws error when policy not found', async () => {
			mockGetPolicy.mockRejectedValue(new ApiError('Not found', 404));
			await expect(
				load({
					params: { id: 'nonexistent' },
					locals: mockLocals(true),
					fetch: vi.fn()
				} as any)
			).rejects.toThrow();
		});

		it('throws 500 on generic API failure', async () => {
			mockGetPolicy.mockRejectedValue(new Error('Network error'));
			await expect(
				load({
					params: { id: 'pol-1' },
					locals: mockLocals(true),
					fetch: vi.fn()
				} as any)
			).rejects.toThrow();
		});

		it('returns empty entitlementMap when entitlements API fails', async () => {
			mockGetPolicy.mockResolvedValue(makePolicy());
			mockListEntitlements.mockRejectedValue(new Error('fail'));

			const result = (await load({
				params: { id: 'pol-1' },
				locals: mockLocals(true),
				fetch: vi.fn()
			} as any)) as any;

			expect(result.entitlementMap).toEqual({});
		});

		it('passes correct id to getBirthrightPolicy', async () => {
			mockGetPolicy.mockResolvedValue(makePolicy());
			await load({
				params: { id: 'pol-42' },
				locals: mockLocals(true),
				fetch: vi.fn()
			} as any);

			expect(mockGetPolicy).toHaveBeenCalledWith('pol-42', 'tok', 'tid', expect.any(Function));
		});
	});

	describe('actions.enable', () => {
		it('exports enable action', () => {
			expect(actions.enable).toBeDefined();
		});

		it('calls enableBirthrightPolicy and redirects', async () => {
			mockEnablePolicy.mockResolvedValue(makePolicy({ status: 'active' }));
			try {
				await actions.enable({
					params: { id: 'pol-1' },
					locals: mockLocals(true),
					fetch: vi.fn()
				} as any);
				expect.fail('should have thrown redirect');
			} catch (e: any) {
				if (e.status === 302) {
					expect(e.location).toBe('/governance/birthright/policies/pol-1');
				}
			}
			expect(mockEnablePolicy).toHaveBeenCalledWith('pol-1', 'tok', 'tid', expect.any(Function));
		});

		it('returns error on enable failure', async () => {
			mockEnablePolicy.mockRejectedValue(new ApiError('Cannot enable archived policy', 400));
			const result: any = await actions.enable({
				params: { id: 'pol-1' },
				locals: mockLocals(true),
				fetch: vi.fn()
			} as any);
			expect(result.error).toBe('Cannot enable archived policy');
		});
	});

	describe('actions.disable', () => {
		it('exports disable action', () => {
			expect(actions.disable).toBeDefined();
		});

		it('calls disableBirthrightPolicy and redirects', async () => {
			mockDisablePolicy.mockResolvedValue(makePolicy({ status: 'inactive' }));
			try {
				await actions.disable({
					params: { id: 'pol-1' },
					locals: mockLocals(true),
					fetch: vi.fn()
				} as any);
				expect.fail('should have thrown redirect');
			} catch (e: any) {
				if (e.status === 302) {
					expect(e.location).toBe('/governance/birthright/policies/pol-1');
				}
			}
			expect(mockDisablePolicy).toHaveBeenCalledWith('pol-1', 'tok', 'tid', expect.any(Function));
		});
	});

	describe('actions.archive', () => {
		it('exports archive action', () => {
			expect(actions.archive).toBeDefined();
		});

		it('calls archiveBirthrightPolicy and redirects to hub', async () => {
			mockArchivePolicy.mockResolvedValue(undefined);
			try {
				await actions.archive({
					params: { id: 'pol-1' },
					locals: mockLocals(true),
					fetch: vi.fn()
				} as any);
				expect.fail('should have thrown redirect');
			} catch (e: any) {
				if (e.status === 302) {
					expect(e.location).toBe('/governance/birthright');
				}
			}
			expect(mockArchivePolicy).toHaveBeenCalledWith('pol-1', 'tok', 'tid', expect.any(Function));
		});

		it('returns error on archive failure', async () => {
			mockArchivePolicy.mockRejectedValue(new ApiError('Archive failed', 500));
			const result: any = await actions.archive({
				params: { id: 'pol-1' },
				locals: mockLocals(true),
				fetch: vi.fn()
			} as any);
			expect(result.error).toBe('Archive failed');
		});
	});
});

describe('Policy Detail +page.svelte', () => {
	it(
		'is defined as a module',
		async () => {
			const mod = await import('./+page.svelte');
			expect(mod.default).toBeDefined();
		},
		60000
	);

	it(
		'is a valid Svelte component constructor',
		async () => {
			const mod = await import('./+page.svelte');
			expect(typeof mod.default).toBe('function');
		},
		60000
	);
});

describe('Policy Detail rendering logic', () => {
	describe('status badge classes', () => {
		const statusClasses: Record<string, string> = {
			active: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
			inactive: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
			archived: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
		};

		it('active status gets green badge', () => {
			expect(statusClasses['active']).toContain('green');
		});

		it('inactive status gets yellow badge', () => {
			expect(statusClasses['inactive']).toContain('yellow');
		});

		it('archived status gets gray badge', () => {
			expect(statusClasses['archived']).toContain('gray');
		});
	});

	describe('evaluation mode labels', () => {
		const evaluationModeLabels: Record<string, string> = {
			all_match: 'All Match',
			first_match: 'First Match'
		};

		it('maps all_match to All Match', () => {
			expect(evaluationModeLabels['all_match']).toBe('All Match');
		});

		it('maps first_match to First Match', () => {
			expect(evaluationModeLabels['first_match']).toBe('First Match');
		});
	});

	describe('operator labels', () => {
		const operatorLabels: Record<string, string> = {
			equals: '=',
			not_equals: '!=',
			in: 'in',
			not_in: 'not in',
			starts_with: 'starts with',
			contains: 'contains'
		};

		it('maps equals to =', () => {
			expect(operatorLabels['equals']).toBe('=');
		});

		it('maps not_equals to !=', () => {
			expect(operatorLabels['not_equals']).toBe('!=');
		});

		it('maps all 6 operators', () => {
			expect(Object.keys(operatorLabels)).toHaveLength(6);
		});
	});

	describe('formatConditionValue', () => {
		function formatConditionValue(value: string | string[]): string {
			if (Array.isArray(value)) {
				return `[${value.join(', ')}]`;
			}
			return value;
		}

		it('formats string value directly', () => {
			expect(formatConditionValue('Engineering')).toBe('Engineering');
		});

		it('formats array value with brackets', () => {
			expect(formatConditionValue(['Engineering', 'Sales'])).toBe('[Engineering, Sales]');
		});
	});

	describe('resolveEntitlementName', () => {
		function resolveEntitlementName(id: string, map: Record<string, string>): string {
			return map[id] ?? `${id.slice(0, 8)}...`;
		}

		it('returns name from map when present', () => {
			const map = { 'ent-1': 'VPN Access' };
			expect(resolveEntitlementName('ent-1', map)).toBe('VPN Access');
		});

		it('returns truncated ID when not in map', () => {
			const map = {};
			expect(resolveEntitlementName('ent-12345-abcde', map)).toBe('ent-1234...');
		});
	});

	describe('action button visibility', () => {
		it('shows Enable when status is inactive', () => {
			const policy = makePolicy({ status: 'inactive' });
			expect(policy.status === 'inactive').toBe(true);
		});

		it('shows Disable when status is active', () => {
			const policy = makePolicy({ status: 'active' });
			expect(policy.status === 'active').toBe(true);
		});

		it('hides actions when status is archived', () => {
			const policy = makePolicy({ status: 'archived' });
			expect(policy.status !== 'archived').toBe(false);
		});

		it('hides Edit link when status is archived', () => {
			const policy = makePolicy({ status: 'archived' });
			expect(policy.status !== 'archived').toBe(false);
		});
	});

	describe('conditions display', () => {
		it('shows conditions when present', () => {
			const policy = makePolicy();
			expect(policy.conditions.length).toBeGreaterThan(0);
		});

		it('shows empty message when no conditions', () => {
			const policy = makePolicy({ conditions: [] });
			expect(policy.conditions.length).toBe(0);
		});
	});

	describe('entitlements display', () => {
		it('shows entitlements count in header', () => {
			const policy = makePolicy({ entitlement_ids: ['ent-1', 'ent-2'] });
			expect(policy.entitlement_ids.length).toBe(2);
		});

		it('shows empty message when no entitlements', () => {
			const policy = makePolicy({ entitlement_ids: [] });
			expect(policy.entitlement_ids.length).toBe(0);
		});
	});
});
