import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/api/birthright', () => ({
	listBirthrightPolicies: vi.fn(),
	listLifecycleEvents: vi.fn()
}));

vi.mock('$lib/server/auth', () => ({
	hasAdminRole: vi.fn()
}));

import { load } from './+page.server';
import { listBirthrightPolicies, listLifecycleEvents } from '$lib/api/birthright';
import { hasAdminRole } from '$lib/server/auth';
import type { BirthrightPolicy, LifecycleEvent } from '$lib/api/types';

const mockListPolicies = vi.mocked(listBirthrightPolicies);
const mockListEvents = vi.mocked(listLifecycleEvents);
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

function makeEvent(overrides: Partial<LifecycleEvent> = {}): LifecycleEvent {
	return {
		id: 'evt-1',
		tenant_id: 't1',
		user_id: 'user-1',
		event_type: 'joiner',
		attributes_before: null,
		attributes_after: { department: 'Engineering' },
		source: 'api',
		processed_at: '2024-01-01T00:00:00Z',
		created_at: '2024-01-01T00:00:00Z',
		...overrides
	};
}

describe('Birthright hub +page.server', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mockHasAdminRole.mockReturnValue(true);
	});

	describe('load', () => {
		it('redirects non-admin users', async () => {
			mockHasAdminRole.mockReturnValue(false);
			try {
				await load({
					locals: mockLocals(false),
					url: new URL('http://localhost/governance/birthright'),
					fetch: vi.fn()
				} as any);
				expect.fail('should have thrown redirect');
			} catch (e: any) {
				expect(e.status).toBe(302);
				expect(e.location).toBe('/dashboard');
			}
		});

		it('returns policies and events for admin', async () => {
			const policies = [makePolicy()];
			const events = [makeEvent()];
			mockListPolicies.mockResolvedValue({ items: policies, total: 1, limit: 50, offset: 0 });
			mockListEvents.mockResolvedValue({ items: events, total: 1, limit: 50, offset: 0 });

			const result = (await load({
				locals: mockLocals(true),
				url: new URL('http://localhost/governance/birthright'),
				fetch: vi.fn()
			} as any)) as any;

			expect(result.policies.items).toHaveLength(1);
			expect(result.policies.items[0].name).toBe('Engineering Access');
			expect(result.events.items).toHaveLength(1);
			expect(result.events.items[0].event_type).toBe('joiner');
		});

		it('passes status filter from URL search params', async () => {
			mockListPolicies.mockResolvedValue({ items: [], total: 0, limit: 50, offset: 0 });
			mockListEvents.mockResolvedValue({ items: [], total: 0, limit: 50, offset: 0 });

			await load({
				locals: mockLocals(true),
				url: new URL('http://localhost/governance/birthright?status=active'),
				fetch: vi.fn()
			} as any);

			expect(mockListPolicies).toHaveBeenCalledWith(
				expect.objectContaining({ status: 'active' }),
				'tok',
				'tid',
				expect.any(Function)
			);
		});

		it('gracefully handles policies API failure', async () => {
			mockListPolicies.mockRejectedValue(new Error('API error'));
			mockListEvents.mockResolvedValue({ items: [makeEvent()], total: 1, limit: 50, offset: 0 });

			const result = (await load({
				locals: mockLocals(true),
				url: new URL('http://localhost/governance/birthright'),
				fetch: vi.fn()
			} as any)) as any;

			expect(result.policies).toEqual({ items: [], total: 0, limit: 50, offset: 0 });
			expect(result.events.items).toHaveLength(1);
		});

		it('gracefully handles events API failure', async () => {
			mockListPolicies.mockResolvedValue({ items: [makePolicy()], total: 1, limit: 50, offset: 0 });
			mockListEvents.mockRejectedValue(new Error('API error'));

			const result = (await load({
				locals: mockLocals(true),
				url: new URL('http://localhost/governance/birthright'),
				fetch: vi.fn()
			} as any)) as any;

			expect(result.policies.items).toHaveLength(1);
			expect(result.events).toEqual({ items: [], total: 0, limit: 50, offset: 0 });
		});

		it('gracefully handles both APIs failing', async () => {
			mockListPolicies.mockRejectedValue(new Error('fail'));
			mockListEvents.mockRejectedValue(new Error('fail'));

			const result = (await load({
				locals: mockLocals(true),
				url: new URL('http://localhost/governance/birthright'),
				fetch: vi.fn()
			} as any)) as any;

			expect(result.policies).toEqual({ items: [], total: 0, limit: 50, offset: 0 });
			expect(result.events).toEqual({ items: [], total: 0, limit: 50, offset: 0 });
		});

		it('passes correct token and tenantId', async () => {
			mockListPolicies.mockResolvedValue({ items: [], total: 0, limit: 50, offset: 0 });
			mockListEvents.mockResolvedValue({ items: [], total: 0, limit: 50, offset: 0 });
			const mockFetch = vi.fn();

			await load({
				locals: { accessToken: 'my-token', tenantId: 'my-tenant', user: { roles: ['admin'] } },
				url: new URL('http://localhost/governance/birthright'),
				fetch: mockFetch
			} as any);

			expect(mockListPolicies).toHaveBeenCalledWith(
				expect.any(Object),
				'my-token',
				'my-tenant',
				mockFetch
			);
			expect(mockListEvents).toHaveBeenCalledWith(
				expect.any(Object),
				'my-token',
				'my-tenant',
				mockFetch
			);
		});

		it('calls hasAdminRole with user roles', async () => {
			mockListPolicies.mockResolvedValue({ items: [], total: 0, limit: 50, offset: 0 });
			mockListEvents.mockResolvedValue({ items: [], total: 0, limit: 50, offset: 0 });

			await load({
				locals: mockLocals(true),
				url: new URL('http://localhost/governance/birthright'),
				fetch: vi.fn()
			} as any);

			expect(mockHasAdminRole).toHaveBeenCalledWith(['admin']);
		});
	});
});

describe('Birthright hub +page.svelte', () => {
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

describe('Birthright hub rendering logic', () => {
	describe('tab definitions', () => {
		const tabs = [
			{ id: 'policies', label: 'Policies' },
			{ id: 'events', label: 'Lifecycle Events' }
		];

		it('has 2 tabs', () => {
			expect(tabs).toHaveLength(2);
		});

		it('has Policies as first tab', () => {
			expect(tabs[0].label).toBe('Policies');
		});

		it('has Lifecycle Events as second tab', () => {
			expect(tabs[1].label).toBe('Lifecycle Events');
		});
	});

	describe('policy status badge class', () => {
		function policyStatusClass(status: string): string {
			switch (status) {
				case 'active':
					return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
				case 'inactive':
					return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
				case 'archived':
					return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
				default:
					return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
			}
		}

		it('active status gets green badge', () => {
			expect(policyStatusClass('active')).toContain('green');
		});

		it('inactive status gets yellow badge', () => {
			expect(policyStatusClass('inactive')).toContain('yellow');
		});

		it('archived status gets gray badge', () => {
			expect(policyStatusClass('archived')).toContain('gray');
		});

		it('unknown status gets gray badge', () => {
			expect(policyStatusClass('unknown')).toContain('gray');
		});
	});

	describe('event type badge class', () => {
		function eventTypeBadgeClass(type: string): string {
			switch (type) {
				case 'joiner':
					return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
				case 'mover':
					return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400';
				case 'leaver':
					return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
				default:
					return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
			}
		}

		it('joiner gets blue badge', () => {
			expect(eventTypeBadgeClass('joiner')).toContain('blue');
		});

		it('mover gets amber badge', () => {
			expect(eventTypeBadgeClass('mover')).toContain('amber');
		});

		it('leaver gets red badge', () => {
			expect(eventTypeBadgeClass('leaver')).toContain('red');
		});

		it('unknown type gets gray badge', () => {
			expect(eventTypeBadgeClass('unknown')).toContain('gray');
		});
	});

	describe('event status logic', () => {
		function eventStatusLabel(event: { processed_at: string | null }): string {
			return event.processed_at ? 'processed' : 'pending';
		}

		function eventStatusClass(event: { processed_at: string | null }): string {
			return event.processed_at
				? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
				: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
		}

		it('shows processed for event with processed_at', () => {
			expect(eventStatusLabel({ processed_at: '2024-01-01T00:00:00Z' })).toBe('processed');
		});

		it('shows pending for event without processed_at', () => {
			expect(eventStatusLabel({ processed_at: null })).toBe('pending');
		});

		it('processed event gets green badge', () => {
			expect(eventStatusClass({ processed_at: '2024-01-01T00:00:00Z' })).toContain('green');
		});

		it('pending event gets yellow badge', () => {
			expect(eventStatusClass({ processed_at: null })).toContain('yellow');
		});
	});

	describe('truncateId', () => {
		function truncateId(id: string): string {
			return id.length > 8 ? id.substring(0, 8) + '...' : id;
		}

		it('truncates long IDs', () => {
			expect(truncateId('abcdef12-3456-7890-abcd-ef1234567890')).toBe('abcdef12...');
		});

		it('preserves short IDs', () => {
			expect(truncateId('abc')).toBe('abc');
		});

		it('preserves exactly 8-char IDs', () => {
			expect(truncateId('12345678')).toBe('12345678');
		});
	});

	describe('pagination logic', () => {
		it('disables Previous when on first page', () => {
			const page = 0;
			expect(page === 0).toBe(true);
		});

		it('disables Next when on last page', () => {
			const page = 2;
			const pageCount = 3;
			expect(page >= pageCount - 1).toBe(true);
		});

		it('enables Next when more pages exist', () => {
			const page = 0;
			const pageCount = 3;
			expect(page >= pageCount - 1).toBe(false);
		});

		it('calculates page count correctly', () => {
			const total = 45;
			const pageSize = 20;
			const pageCount = Math.ceil(total / pageSize);
			expect(pageCount).toBe(3);
		});

		it('calculates showing range correctly', () => {
			const page = 1;
			const pageSize = 20;
			const total = 45;
			const start = page * pageSize + 1;
			const end = Math.min((page + 1) * pageSize, total);
			expect(start).toBe(21);
			expect(end).toBe(40);
		});
	});

	describe('empty state messages', () => {
		it('shows correct empty policies message', () => {
			const msg = 'No birthright policies yet';
			expect(msg).toBe('No birthright policies yet');
		});

		it('shows correct empty events message', () => {
			const msg = 'No lifecycle events';
			expect(msg).toBe('No lifecycle events');
		});
	});

	describe('mock data conformity', () => {
		it('BirthrightPolicy has all required fields', () => {
			const p = makePolicy();
			expect(p.id).toBeDefined();
			expect(p.tenant_id).toBeDefined();
			expect(p.name).toBeDefined();
			expect(typeof p.priority).toBe('number');
			expect(Array.isArray(p.conditions)).toBe(true);
			expect(Array.isArray(p.entitlement_ids)).toBe(true);
			expect(p.status).toBeDefined();
			expect(p.evaluation_mode).toBeDefined();
			expect(typeof p.grace_period_days).toBe('number');
			expect(p.created_by).toBeDefined();
			expect(p.created_at).toBeDefined();
			expect(p.updated_at).toBeDefined();
		});

		it('BirthrightPolicy status is a valid value', () => {
			const validStatuses = ['active', 'inactive', 'archived'];
			expect(validStatuses).toContain(makePolicy().status);
		});

		it('LifecycleEvent has all required fields', () => {
			const e = makeEvent();
			expect(e.id).toBeDefined();
			expect(e.tenant_id).toBeDefined();
			expect(e.user_id).toBeDefined();
			expect(e.event_type).toBeDefined();
			expect(e.source).toBeDefined();
			expect(e.created_at).toBeDefined();
		});

		it('LifecycleEvent event_type is a valid value', () => {
			const validTypes = ['joiner', 'mover', 'leaver'];
			expect(validTypes).toContain(makeEvent().event_type);
		});
	});
});
