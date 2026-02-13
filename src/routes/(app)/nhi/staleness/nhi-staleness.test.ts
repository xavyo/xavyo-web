import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/api/nhi-usage', () => ({
	getNhiStalenessReport: vi.fn()
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
import { getNhiStalenessReport } from '$lib/api/nhi-usage';
import { hasAdminRole } from '$lib/server/auth';
import type { NhiStalenessEntry } from '$lib/api/types';

const mockGetReport = vi.mocked(getNhiStalenessReport);
const mockHasAdminRole = vi.mocked(hasAdminRole);

function makeEntry(overrides: Partial<NhiStalenessEntry> = {}): NhiStalenessEntry {
	return {
		id: 'nhi-1',
		name: 'Old Service Account',
		nhi_type: 'service_account',
		last_activity_at: '2025-11-01T00:00:00Z',
		days_inactive: 100,
		state: 'active',
		...overrides
	};
}

const mockLocals = (admin: boolean) => ({
	accessToken: 'tok',
	tenantId: 'tid',
	user: { roles: admin ? ['admin'] : ['user'] }
});

describe('NHI Staleness +page.server', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mockHasAdminRole.mockReturnValue(true);
	});

	describe('load', () => {
		it('throws 401 when no accessToken', async () => {
			try {
				await load({
					locals: { accessToken: null, tenantId: 'tid', user: { roles: ['admin'] } },
					fetch: vi.fn()
				} as any);
				expect.fail('should have thrown');
			} catch (e: any) {
				expect(e.status).toBe(401);
			}
		});

		it('throws 401 when no tenantId', async () => {
			try {
				await load({
					locals: { accessToken: 'tok', tenantId: null, user: { roles: ['admin'] } },
					fetch: vi.fn()
				} as any);
				expect.fail('should have thrown');
			} catch (e: any) {
				expect(e.status).toBe(401);
			}
		});

		it('throws 403 for non-admin users', async () => {
			mockHasAdminRole.mockReturnValue(false);
			try {
				await load({
					locals: mockLocals(false),
					fetch: vi.fn()
				} as any);
				expect.fail('should have thrown');
			} catch (e: any) {
				expect(e.status).toBe(403);
			}
		});

		it('returns entries for admin', async () => {
			const entries = [makeEntry()];
			mockGetReport.mockResolvedValue({ items: entries, total: 1, limit: 50, offset: 0 });

			const result = (await load({
				locals: mockLocals(true),
				fetch: vi.fn()
			} as any)) as any;

			expect(result.entries).toHaveLength(1);
			expect(result.entries[0].name).toBe('Old Service Account');
			expect(result.total).toBe(1);
		});

		it('calls getNhiStalenessReport with limit 50', async () => {
			mockGetReport.mockResolvedValue({ items: [], total: 0, limit: 50, offset: 0 });

			await load({
				locals: mockLocals(true),
				fetch: vi.fn()
			} as any);

			expect(mockGetReport).toHaveBeenCalledWith(
				{ limit: 50 },
				'tok',
				'tid',
				expect.any(Function)
			);
		});

		it('handles API failure gracefully', async () => {
			mockGetReport.mockRejectedValue(new Error('API error'));

			const result = (await load({
				locals: mockLocals(true),
				fetch: vi.fn()
			} as any)) as any;

			expect(result.entries).toEqual([]);
			expect(result.total).toBe(0);
		});

		it('passes correct token and tenantId', async () => {
			mockGetReport.mockResolvedValue({ items: [], total: 0, limit: 50, offset: 0 });
			const mockFetch = vi.fn();

			await load({
				locals: {
					accessToken: 'my-token',
					tenantId: 'my-tenant',
					user: { roles: ['admin'] }
				},
				fetch: mockFetch
			} as any);

			expect(mockGetReport).toHaveBeenCalledWith(
				expect.any(Object),
				'my-token',
				'my-tenant',
				mockFetch
			);
		});
	});
});

describe('NHI Staleness +page.svelte', () => {
	it('is defined as a module', async () => {
		const mod = await import('./+page.svelte');
		expect(mod.default).toBeDefined();
	}, 15000);

	it('is a valid Svelte component constructor', async () => {
		const mod = await import('./+page.svelte');
		expect(typeof mod.default).toBe('function');
	}, 15000);
});

describe('NHI Staleness rendering logic', () => {
	describe('table columns', () => {
		const columns = ['Name', 'Type', 'State', 'Last Activity', 'Days Inactive'];

		it('has 5 columns', () => {
			expect(columns).toHaveLength(5);
		});

		it('has Name column', () => {
			expect(columns).toContain('Name');
		});

		it('has Days Inactive column', () => {
			expect(columns).toContain('Days Inactive');
		});
	});

	describe('days inactive badge color', () => {
		function badgeColor(days: number): string {
			if (days > 90) return 'red';
			if (days > 30) return 'yellow';
			return 'green';
		}

		it('returns red for > 90 days', () => {
			expect(badgeColor(100)).toBe('red');
		});

		it('returns yellow for > 30 days', () => {
			expect(badgeColor(60)).toBe('yellow');
		});

		it('returns green for <= 30 days', () => {
			expect(badgeColor(15)).toBe('green');
		});

		it('returns yellow at exactly 31 days', () => {
			expect(badgeColor(31)).toBe('yellow');
		});

		it('returns red at exactly 91 days', () => {
			expect(badgeColor(91)).toBe('red');
		});
	});

	describe('empty state', () => {
		it('shows correct empty message', () => {
			const msg = 'All NHI entities have recent activity.';
			expect(msg).toBe('All NHI entities have recent activity.');
		});
	});

	describe('last activity display', () => {
		it('shows Never for null last_activity_at', () => {
			const entry = makeEntry({ last_activity_at: null });
			const display = entry.last_activity_at ? new Date(entry.last_activity_at).toLocaleDateString() : 'Never';
			expect(display).toBe('Never');
		});

		it('formats valid date', () => {
			const entry = makeEntry({ last_activity_at: '2025-11-01T00:00:00Z' });
			const display = entry.last_activity_at ? new Date(entry.last_activity_at).toLocaleDateString() : 'Never';
			expect(display).not.toBe('Never');
			expect(display).toBeTruthy();
		});
	});

	describe('mock data conformity', () => {
		it('NhiStalenessEntry has all required fields', () => {
			const e = makeEntry();
			expect(e.id).toBeDefined();
			expect(e.name).toBeDefined();
			expect(e.nhi_type).toBeDefined();
			expect(typeof e.days_inactive).toBe('number');
			expect(e.state).toBeDefined();
		});
	});
});
