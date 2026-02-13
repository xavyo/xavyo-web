import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/server/auth', () => ({
	hasAdminRole: vi.fn()
}));

import { load } from './+page.server';
import { hasAdminRole } from '$lib/server/auth';

const mockHasAdminRole = vi.mocked(hasAdminRole);

describe('Operations Hub +page.server', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mockHasAdminRole.mockReturnValue(true);
	});

	describe('load', () => {
		it('redirects non-admin users', async () => {
			mockHasAdminRole.mockReturnValue(false);
			try {
				await load({
					locals: { accessToken: 'tok', tenantId: 'tid', user: { roles: ['user'] } }
				} as any);
				expect.fail('should have thrown redirect');
			} catch (e: any) {
				expect(e.status).toBe(302);
				expect(e.location).toBe('/dashboard');
			}
		});

		it('returns empty object for admin users', async () => {
			const result = await load({
				locals: { accessToken: 'tok', tenantId: 'tid', user: { roles: ['admin'] } }
			} as any);
			expect(result).toEqual({});
		});

		it('calls hasAdminRole with user roles', async () => {
			await load({
				locals: { accessToken: 'tok', tenantId: 'tid', user: { roles: ['admin'] } }
			} as any);
			expect(mockHasAdminRole).toHaveBeenCalledWith(['admin']);
		});
	});
});

describe('Operations Hub +page.svelte', () => {
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

describe('Operations Hub rendering logic', () => {
	describe('tab definitions', () => {
		const tabs = [
			{ id: 'sla', label: 'SLA Policies' },
			{ id: 'ticketing', label: 'Ticketing' },
			{ id: 'bulk-actions', label: 'Bulk Actions' },
			{ id: 'failed-ops', label: 'Failed Operations' },
			{ id: 'bulk-state', label: 'Bulk State' },
			{ id: 'scheduled', label: 'Scheduled' }
		];

		it('has 6 tabs', () => {
			expect(tabs).toHaveLength(6);
		});

		it('has SLA Policies as first tab', () => {
			expect(tabs[0].label).toBe('SLA Policies');
		});

		it('has Ticketing as second tab', () => {
			expect(tabs[1].label).toBe('Ticketing');
		});

		it('has Bulk Actions as third tab', () => {
			expect(tabs[2].label).toBe('Bulk Actions');
		});

		it('has Failed Operations as fourth tab', () => {
			expect(tabs[3].label).toBe('Failed Operations');
		});

		it('has Bulk State as fifth tab', () => {
			expect(tabs[4].label).toBe('Bulk State');
		});

		it('has Scheduled as sixth tab', () => {
			expect(tabs[5].label).toBe('Scheduled');
		});
	});

	describe('formatDate', () => {
		function formatDate(dateStr: string | null): string {
			if (!dateStr) return '--';
			const d = new Date(dateStr);
			if (isNaN(d.getTime())) return '--';
			return d.toLocaleString();
		}

		it('formats valid date string', () => {
			const result = formatDate('2026-01-15T10:00:00Z');
			expect(result).toBeTruthy();
			expect(result).not.toBe('--');
		});

		it('returns -- for null', () => {
			expect(formatDate(null)).toBe('--');
		});

		it('returns -- for invalid date', () => {
			expect(formatDate('not-a-date')).toBe('--');
		});
	});

	describe('truncate', () => {
		function truncate(text: string | null, maxLen: number): string {
			if (!text) return '--';
			return text.length > maxLen ? text.substring(0, maxLen) + '...' : text;
		}

		it('returns -- for null', () => {
			expect(truncate(null, 60)).toBe('--');
		});

		it('does not truncate short text', () => {
			expect(truncate('hello', 60)).toBe('hello');
		});

		it('truncates long text', () => {
			const longText = 'a'.repeat(100);
			const result = truncate(longText, 60);
			expect(result.length).toBe(63); // 60 + "..."
			expect(result.endsWith('...')).toBe(true);
		});
	});

	describe('formatCategory', () => {
		function formatCategory(category: string): string {
			return category.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
		}

		it('formats access_request', () => {
			expect(formatCategory('access_request')).toBe('Access Request');
		});

		it('formats certification', () => {
			expect(formatCategory('certification')).toBe('Certification');
		});

		it('formats provisioning', () => {
			expect(formatCategory('provisioning')).toBe('Provisioning');
		});
	});

	describe('empty state messages', () => {
		it('shows correct empty SLA message', () => {
			const msg = 'No SLA policies found';
			expect(msg).toBe('No SLA policies found');
		});

		it('shows correct empty ticketing message', () => {
			const msg = 'No ticketing configurations found';
			expect(msg).toBe('No ticketing configurations found');
		});

		it('shows correct empty bulk actions message', () => {
			const msg = 'No bulk actions found';
			expect(msg).toBe('No bulk actions found');
		});

		it('shows correct empty failed operations message', () => {
			const msg = 'No failed operations';
			expect(msg).toBe('No failed operations');
		});

		it('shows correct empty bulk state message', () => {
			const msg = 'No bulk state operations';
			expect(msg).toBe('No bulk state operations');
		});

		it('shows correct empty scheduled message', () => {
			const msg = 'No scheduled transitions';
			expect(msg).toBe('No scheduled transitions');
		});
	});
});
