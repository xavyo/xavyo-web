import { describe, it, expect, vi } from 'vitest';

vi.mock('$lib/server/auth', () => ({
	hasAdminRole: vi.fn()
}));

vi.mock('$lib/api/governance-roles', () => ({
	listRoles: vi.fn()
}));

import { load } from './+page.server';
import { hasAdminRole } from '$lib/server/auth';
import { listRoles } from '$lib/api/governance-roles';

const mockLocals = (admin: boolean) => ({
	accessToken: 'tok',
	tenantId: 'tid',
	user: { roles: admin ? ['admin'] : ['user'] }
});

describe('Governance Roles list +page.server', () => {
	it('redirects non-admin users', async () => {
		vi.mocked(hasAdminRole).mockReturnValue(false);
		try {
			await load({
				locals: mockLocals(false),
				url: new URL('http://localhost/governance/roles'),
				fetch: vi.fn()
			} as any);
			expect.fail('should have thrown redirect');
		} catch (e: any) {
			expect(e.status).toBe(302);
			expect(e.location).toBe('/dashboard');
		}
	});

	it('loads roles for admin users with default pagination', async () => {
		vi.mocked(hasAdminRole).mockReturnValue(true);
		const mockResponse = { items: [{ id: 'r1', name: 'Role 1' }], total: 1, limit: 20, offset: 0 };
		vi.mocked(listRoles).mockResolvedValue(mockResponse as any);

		const result = await load({
			locals: mockLocals(true),
			url: new URL('http://localhost/governance/roles'),
			fetch: vi.fn()
		} as any) as any;

		expect(result.roles).toEqual(mockResponse);
		expect(listRoles).toHaveBeenCalledWith(
			{ limit: 20, offset: 0 },
			'tok',
			'tid',
			expect.any(Function)
		);
	});

	it('reads pagination from URL searchParams', async () => {
		vi.mocked(hasAdminRole).mockReturnValue(true);
		const mockResponse = { items: [], total: 50, limit: 10, offset: 40 };
		vi.mocked(listRoles).mockResolvedValue(mockResponse as any);

		const result = await load({
			locals: mockLocals(true),
			url: new URL('http://localhost/governance/roles?offset=40&limit=10'),
			fetch: vi.fn()
		} as any) as any;

		expect(result.roles).toEqual(mockResponse);
		expect(listRoles).toHaveBeenCalledWith(
			{ limit: 10, offset: 40 },
			'tok',
			'tid',
			expect.any(Function)
		);
	});

	it('returns empty items array when listRoles throws', async () => {
		vi.mocked(hasAdminRole).mockReturnValue(true);
		vi.mocked(listRoles).mockRejectedValue(new Error('API error'));

		const result = await load({
			locals: mockLocals(true),
			url: new URL('http://localhost/governance/roles'),
			fetch: vi.fn()
		} as any) as any;

		expect(result.roles).toEqual({ items: [], total: 0, limit: 20, offset: 0 });
	});

	it('calls listRoles with correct token and tenantId', async () => {
		vi.mocked(hasAdminRole).mockReturnValue(true);
		vi.mocked(listRoles).mockResolvedValue({ items: [], total: 0, limit: 20, offset: 0 } as any);

		const mockFetch = vi.fn();
		await load({
			locals: { accessToken: 'my-token', tenantId: 'my-tenant', user: { roles: ['admin'] } },
			url: new URL('http://localhost/governance/roles'),
			fetch: mockFetch
		} as any);

		expect(listRoles).toHaveBeenCalledWith(
			{ limit: 20, offset: 0 },
			'my-token',
			'my-tenant',
			mockFetch
		);
	});
});
