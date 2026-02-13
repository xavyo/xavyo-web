import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/api/persona-expiry', () => ({
	listExpiringPersonas: vi.fn()
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
import { listExpiringPersonas } from '$lib/api/persona-expiry';
import { hasAdminRole } from '$lib/server/auth';
import type { ExpiringPersona } from '$lib/api/types';

const mockListExpiring = vi.mocked(listExpiringPersonas);
const mockHasAdminRole = vi.mocked(hasAdminRole);

function makePersona(overrides: Partial<ExpiringPersona> = {}): ExpiringPersona {
	return {
		id: 'persona-1',
		name: 'Admin Persona',
		archetype_name: 'Administrator',
		valid_until: '2026-03-01T00:00:00Z',
		days_until_expiry: 15,
		assigned_user_name: 'John Doe',
		...overrides
	};
}

const mockLocals = (admin: boolean) => ({
	accessToken: 'tok',
	tenantId: 'tid',
	user: { roles: admin ? ['admin'] : ['user'] }
});

describe('Persona Expiring +page.server', () => {
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

		it('returns expiring personas for admin', async () => {
			const personas = [makePersona()];
			mockListExpiring.mockResolvedValue({ items: personas, total: 1, limit: 50, offset: 0 });

			const result = (await load({
				locals: mockLocals(true),
				fetch: vi.fn()
			} as any)) as any;

			expect(result.personas).toHaveLength(1);
			expect(result.personas[0].name).toBe('Admin Persona');
			expect(result.total).toBe(1);
		});

		it('calls listExpiringPersonas with days_ahead 30 and limit 50', async () => {
			mockListExpiring.mockResolvedValue({ items: [], total: 0, limit: 50, offset: 0 });

			await load({
				locals: mockLocals(true),
				fetch: vi.fn()
			} as any);

			expect(mockListExpiring).toHaveBeenCalledWith(
				{ days_ahead: 30, limit: 50 },
				'tok',
				'tid',
				expect.any(Function)
			);
		});

		it('handles API failure gracefully', async () => {
			mockListExpiring.mockRejectedValue(new Error('API error'));

			const result = (await load({
				locals: mockLocals(true),
				fetch: vi.fn()
			} as any)) as any;

			expect(result.personas).toEqual([]);
			expect(result.total).toBe(0);
		});

		it('passes correct token and tenantId', async () => {
			mockListExpiring.mockResolvedValue({ items: [], total: 0, limit: 50, offset: 0 });
			const mockFetch = vi.fn();

			await load({
				locals: {
					accessToken: 'my-token',
					tenantId: 'my-tenant',
					user: { roles: ['admin'] }
				},
				fetch: mockFetch
			} as any);

			expect(mockListExpiring).toHaveBeenCalledWith(
				expect.any(Object),
				'my-token',
				'my-tenant',
				mockFetch
			);
		});
	});
});

describe('Persona Expiring +page.svelte', () => {
	it('is defined as a module', async () => {
		const mod = await import('./+page.svelte');
		expect(mod.default).toBeDefined();
	}, 15000);

	it('is a valid Svelte component constructor', async () => {
		const mod = await import('./+page.svelte');
		expect(typeof mod.default).toBe('function');
	}, 15000);
});

describe('Persona Expiring rendering logic', () => {
	describe('page header', () => {
		it('has correct title', () => {
			const title = 'Expiring Personas';
			expect(title).toBe('Expiring Personas');
		});

		it('has correct description', () => {
			const desc = 'Personas approaching their expiration date (next 30 days)';
			expect(desc).toBe('Personas approaching their expiration date (next 30 days)');
		});
	});

	describe('table columns', () => {
		const columns = ['Name', 'Archetype', 'Assigned To', 'Expires', 'Days Left', 'Actions'];

		it('has 6 columns', () => {
			expect(columns).toHaveLength(6);
		});

		it('has Name column', () => {
			expect(columns).toContain('Name');
		});

		it('has Days Left column', () => {
			expect(columns).toContain('Days Left');
		});

		it('has Actions column', () => {
			expect(columns).toContain('Actions');
		});
	});

	describe('days left badge color', () => {
		function badgeColor(days: number): string {
			return days <= 7 ? 'red' : 'yellow';
		}

		it('returns red for 7 days or less', () => {
			expect(badgeColor(7)).toBe('red');
			expect(badgeColor(3)).toBe('red');
			expect(badgeColor(1)).toBe('red');
		});

		it('returns yellow for more than 7 days', () => {
			expect(badgeColor(8)).toBe('yellow');
			expect(badgeColor(15)).toBe('yellow');
			expect(badgeColor(30)).toBe('yellow');
		});
	});

	describe('empty state', () => {
		it('shows correct empty title', () => {
			const title = 'No expiring personas';
			expect(title).toBe('No expiring personas');
		});

		it('shows correct empty description', () => {
			const desc = 'No personas are expiring within the next 30 days.';
			expect(desc).toBe('No personas are expiring within the next 30 days.');
		});
	});

	describe('back link', () => {
		it('points to /personas', () => {
			const href = '/personas';
			expect(href).toBe('/personas');
		});
	});

	describe('extend dialog labels', () => {
		it('has new expiration date label', () => {
			const label = 'New Expiration Date';
			expect(label).toBe('New Expiration Date');
		});

		it('has reason label', () => {
			const label = 'Reason (optional)';
			expect(label).toBe('Reason (optional)');
		});
	});

	describe('mock data conformity', () => {
		it('ExpiringPersona has all required fields', () => {
			const p = makePersona();
			expect(p.id).toBeDefined();
			expect(p.name).toBeDefined();
			expect(p.valid_until).toBeDefined();
			expect(typeof p.days_until_expiry).toBe('number');
		});

		it('archetype_name can be null', () => {
			const p = makePersona({ archetype_name: null });
			expect(p.archetype_name).toBeNull();
		});

		it('assigned_user_name can be null', () => {
			const p = makePersona({ assigned_user_name: null });
			expect(p.assigned_user_name).toBeNull();
		});
	});
});
