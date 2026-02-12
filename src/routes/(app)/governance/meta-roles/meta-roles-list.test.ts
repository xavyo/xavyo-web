import { describe, it, expect, vi } from 'vitest';

vi.mock('$lib/server/auth', () => ({
	hasAdminRole: vi.fn()
}));

vi.mock('$lib/api/meta-roles', () => ({
	listMetaRoles: vi.fn()
}));

import { load } from './+page.server';
import { hasAdminRole } from '$lib/server/auth';
import { listMetaRoles } from '$lib/api/meta-roles';

const mockLocals = (admin: boolean) => ({
	accessToken: 'tok',
	tenantId: 'tid',
	user: { roles: admin ? ['admin'] : ['user'] }
});

describe('Meta-Roles list +page.server', () => {
	it('redirects non-admin users', async () => {
		vi.mocked(hasAdminRole).mockReturnValue(false);
		try {
			await load({
				locals: mockLocals(false),
				url: new URL('http://localhost/governance/meta-roles'),
				fetch: vi.fn()
			} as any);
			expect.fail('should have thrown redirect');
		} catch (e: any) {
			expect(e.status).toBe(302);
			expect(e.location).toBe('/dashboard');
		}
	});

	it('loads meta-roles for admin users with default pagination', async () => {
		vi.mocked(hasAdminRole).mockReturnValue(true);
		const mockResponse = {
			items: [{ id: 'mr1', name: 'Test Meta-Role', priority: 10, status: 'active' }],
			total: 1,
			limit: 20,
			offset: 0
		};
		vi.mocked(listMetaRoles).mockResolvedValue(mockResponse as any);

		const result = (await load({
			locals: mockLocals(true),
			url: new URL('http://localhost/governance/meta-roles'),
			fetch: vi.fn()
		} as any)) as any;

		expect(result.metaRoles).toEqual(mockResponse);
		expect(listMetaRoles).toHaveBeenCalledWith(
			{ status: undefined, name: undefined, limit: 20, offset: 0 },
			'tok',
			'tid',
			expect.any(Function)
		);
	});

	it('reads pagination and filters from URL searchParams', async () => {
		vi.mocked(hasAdminRole).mockReturnValue(true);
		vi.mocked(listMetaRoles).mockResolvedValue({
			items: [],
			total: 0,
			limit: 10,
			offset: 20
		} as any);

		await load({
			locals: mockLocals(true),
			url: new URL(
				'http://localhost/governance/meta-roles?offset=20&limit=10&status=active&name=test'
			),
			fetch: vi.fn()
		} as any);

		expect(listMetaRoles).toHaveBeenCalledWith(
			{ status: 'active', name: 'test', limit: 10, offset: 20 },
			'tok',
			'tid',
			expect.any(Function)
		);
	});

	it('returns empty items array when listMetaRoles throws', async () => {
		vi.mocked(hasAdminRole).mockReturnValue(true);
		vi.mocked(listMetaRoles).mockRejectedValue(new Error('API error'));

		const result = (await load({
			locals: mockLocals(true),
			url: new URL('http://localhost/governance/meta-roles'),
			fetch: vi.fn()
		} as any)) as any;

		expect(result.metaRoles).toEqual({ items: [], total: 0, limit: 20, offset: 0 });
	});

	it('calls listMetaRoles with correct token and tenantId', async () => {
		vi.mocked(hasAdminRole).mockReturnValue(true);
		vi.mocked(listMetaRoles).mockResolvedValue({
			items: [],
			total: 0,
			limit: 20,
			offset: 0
		} as any);

		const mockFetch = vi.fn();
		await load({
			locals: { accessToken: 'my-token', tenantId: 'my-tenant', user: { roles: ['admin'] } },
			url: new URL('http://localhost/governance/meta-roles'),
			fetch: mockFetch
		} as any);

		expect(listMetaRoles).toHaveBeenCalledWith(
			{ status: undefined, name: undefined, limit: 20, offset: 0 },
			'my-token',
			'my-tenant',
			mockFetch
		);
	});
});
