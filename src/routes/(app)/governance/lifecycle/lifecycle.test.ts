import { describe, it, expect, vi } from 'vitest';

vi.mock('$lib/server/auth', () => ({
	hasAdminRole: vi.fn()
}));

vi.mock('$lib/api/lifecycle', () => ({
	listLifecycleConfigs: vi.fn()
}));

import { load } from './+page.server';
import { hasAdminRole } from '$lib/server/auth';
import { listLifecycleConfigs } from '$lib/api/lifecycle';

const mockLocals = (admin: boolean) => ({
	accessToken: 'tok',
	tenantId: 'tid',
	user: { roles: admin ? ['admin'] : ['user'] }
});

describe('Governance Lifecycle hub +page.server', () => {
	it('redirects non-admin users', async () => {
		vi.mocked(hasAdminRole).mockReturnValue(false);
		try {
			await load({
				locals: mockLocals(false),
				url: new URL('http://localhost/governance/lifecycle'),
				fetch: vi.fn()
			} as any);
			expect.fail('should have thrown redirect');
		} catch (e: any) {
			expect(e.status).toBe(302);
			expect(e.location).toBe('/dashboard');
		}
	});

	it('loads configs for admin users with default pagination', async () => {
		vi.mocked(hasAdminRole).mockReturnValue(true);
		const mockResponse = {
			items: [{ id: 'lc1', name: 'User Lifecycle', object_type: 'user' }],
			total: 1,
			limit: 20,
			offset: 0
		};
		vi.mocked(listLifecycleConfigs).mockResolvedValue(mockResponse as any);

		const result = (await load({
			locals: mockLocals(true),
			url: new URL('http://localhost/governance/lifecycle'),
			fetch: vi.fn()
		} as any)) as any;

		expect(result.configs).toEqual(mockResponse);
		expect(listLifecycleConfigs).toHaveBeenCalledWith(
			{ object_type: undefined, is_active: undefined, limit: 20, offset: 0 },
			'tok',
			'tid',
			expect.any(Function)
		);
	});

	it('reads pagination from URL searchParams', async () => {
		vi.mocked(hasAdminRole).mockReturnValue(true);
		const mockResponse = { items: [], total: 50, limit: 10, offset: 40 };
		vi.mocked(listLifecycleConfigs).mockResolvedValue(mockResponse as any);

		const result = (await load({
			locals: mockLocals(true),
			url: new URL('http://localhost/governance/lifecycle?offset=40&limit=10'),
			fetch: vi.fn()
		} as any)) as any;

		expect(result.configs).toEqual(mockResponse);
		expect(listLifecycleConfigs).toHaveBeenCalledWith(
			{ object_type: undefined, is_active: undefined, limit: 10, offset: 40 },
			'tok',
			'tid',
			expect.any(Function)
		);
	});

	it('reads object_type filter from URL', async () => {
		vi.mocked(hasAdminRole).mockReturnValue(true);
		const mockResponse = {
			items: [{ id: 'lc1', object_type: 'user' }],
			total: 1,
			limit: 20,
			offset: 0
		};
		vi.mocked(listLifecycleConfigs).mockResolvedValue(mockResponse as any);

		const result = (await load({
			locals: mockLocals(true),
			url: new URL('http://localhost/governance/lifecycle?object_type=user'),
			fetch: vi.fn()
		} as any)) as any;

		expect(result.configs).toEqual(mockResponse);
		expect(listLifecycleConfigs).toHaveBeenCalledWith(
			{ object_type: 'user', is_active: undefined, limit: 20, offset: 0 },
			'tok',
			'tid',
			expect.any(Function)
		);
	});

	it('reads is_active filter from URL', async () => {
		vi.mocked(hasAdminRole).mockReturnValue(true);
		const mockResponse = {
			items: [{ id: 'lc1', is_active: true }],
			total: 1,
			limit: 20,
			offset: 0
		};
		vi.mocked(listLifecycleConfigs).mockResolvedValue(mockResponse as any);

		const result = (await load({
			locals: mockLocals(true),
			url: new URL('http://localhost/governance/lifecycle?is_active=true'),
			fetch: vi.fn()
		} as any)) as any;

		expect(result.configs).toEqual(mockResponse);
		expect(listLifecycleConfigs).toHaveBeenCalledWith(
			{ object_type: undefined, is_active: true, limit: 20, offset: 0 },
			'tok',
			'tid',
			expect.any(Function)
		);
	});

	it('returns empty items array when listLifecycleConfigs throws', async () => {
		vi.mocked(hasAdminRole).mockReturnValue(true);
		vi.mocked(listLifecycleConfigs).mockRejectedValue(new Error('API error'));

		const result = (await load({
			locals: mockLocals(true),
			url: new URL('http://localhost/governance/lifecycle'),
			fetch: vi.fn()
		} as any)) as any;

		expect(result.configs).toEqual({ items: [], total: 0, limit: 20, offset: 0 });
	});

	it('calls listLifecycleConfigs with correct token and tenantId', async () => {
		vi.mocked(hasAdminRole).mockReturnValue(true);
		vi.mocked(listLifecycleConfigs).mockResolvedValue({
			items: [],
			total: 0,
			limit: 20,
			offset: 0
		} as any);

		const mockFetch = vi.fn();
		await load({
			locals: { accessToken: 'my-token', tenantId: 'my-tenant', user: { roles: ['admin'] } },
			url: new URL('http://localhost/governance/lifecycle'),
			fetch: mockFetch
		} as any);

		expect(listLifecycleConfigs).toHaveBeenCalledWith(
			{ object_type: undefined, is_active: undefined, limit: 20, offset: 0 },
			'my-token',
			'my-tenant',
			mockFetch
		);
	});

	it('returns filters in result', async () => {
		vi.mocked(hasAdminRole).mockReturnValue(true);
		vi.mocked(listLifecycleConfigs).mockResolvedValue({
			items: [],
			total: 0,
			limit: 20,
			offset: 0
		} as any);

		const result = (await load({
			locals: mockLocals(true),
			url: new URL('http://localhost/governance/lifecycle?object_type=Persona&is_active=false'),
			fetch: vi.fn()
		} as any)) as any;

		expect(result.filters).toEqual({ object_type: 'Persona', is_active: false });
	});
});
