import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/server/auth', () => ({
	hasAdminRole: vi.fn()
}));

vi.mock('$lib/api/connectors', () => ({
	listConnectors: vi.fn()
}));

import { load } from './+page.server';
import { hasAdminRole } from '$lib/server/auth';
import { listConnectors } from '$lib/api/connectors';

const mockLocals = (admin: boolean) => ({
	accessToken: 'tok',
	tenantId: 'tid',
	user: { roles: admin ? ['admin'] : ['user'] }
});

describe('Connectors +page.server', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe('load', () => {
		it('redirects non-admin users', async () => {
			vi.mocked(hasAdminRole).mockReturnValue(false);
			try {
				await load({
					locals: mockLocals(false),
					url: new URL('http://localhost/connectors'),
					fetch: vi.fn()
				} as any);
				expect.fail('should have thrown redirect');
			} catch (e: any) {
				expect(e.status).toBe(302);
				expect(e.location).toBe('/dashboard');
			}
		});

		it('returns connectors for admin users', async () => {
			vi.mocked(hasAdminRole).mockReturnValue(true);
			const mockResponse = {
				items: [
					{
						id: 'conn-1',
						name: 'LDAP Connector',
						description: 'Main LDAP',
						connector_type: 'ldap',
						config: {},
						status: 'active',
						created_at: '2026-02-01T00:00:00Z',
						updated_at: '2026-02-01T00:00:00Z'
					}
				],
				total: 1,
				limit: 20,
				offset: 0
			};
			vi.mocked(listConnectors).mockResolvedValue(mockResponse as any);

			const result = (await load({
				locals: mockLocals(true),
				url: new URL('http://localhost/connectors'),
				fetch: vi.fn()
			} as any)) as any;

			expect(result.connectors).toEqual(mockResponse);
		});

		it('reads pagination and filters from URL searchParams', async () => {
			vi.mocked(hasAdminRole).mockReturnValue(true);
			vi.mocked(listConnectors).mockResolvedValue({
				items: [],
				total: 0,
				limit: 10,
				offset: 20
			} as any);

			await load({
				locals: mockLocals(true),
				url: new URL(
					'http://localhost/connectors?offset=20&limit=10&name_contains=ldap&connector_type=ldap&status=active'
				),
				fetch: vi.fn()
			} as any);

			expect(listConnectors).toHaveBeenCalledWith(
				{ name_contains: 'ldap', connector_type: 'ldap', status: 'active', limit: 10, offset: 20 },
				'tok',
				'tid',
				expect.any(Function)
			);
		});

		it('returns empty items array when API throws', async () => {
			vi.mocked(hasAdminRole).mockReturnValue(true);
			vi.mocked(listConnectors).mockRejectedValue(new Error('API error'));

			const result = (await load({
				locals: mockLocals(true),
				url: new URL('http://localhost/connectors'),
				fetch: vi.fn()
			} as any)) as any;

			expect(result.connectors).toEqual({ items: [], total: 0, limit: 20, offset: 0 });
		});

		it('passes correct token and tenantId to listConnectors', async () => {
			vi.mocked(hasAdminRole).mockReturnValue(true);
			vi.mocked(listConnectors).mockResolvedValue({
				items: [],
				total: 0,
				limit: 20,
				offset: 0
			} as any);

			const mockFetch = vi.fn();
			await load({
				locals: { accessToken: 'my-token', tenantId: 'my-tenant', user: { roles: ['admin'] } },
				url: new URL('http://localhost/connectors'),
				fetch: mockFetch
			} as any);

			expect(listConnectors).toHaveBeenCalledWith(
				{ name_contains: undefined, connector_type: undefined, status: undefined, limit: 20, offset: 0 },
				'my-token',
				'my-tenant',
				mockFetch
			);
		});

		it('passes name_contains filter through when provided', async () => {
			vi.mocked(hasAdminRole).mockReturnValue(true);
			vi.mocked(listConnectors).mockResolvedValue({
				items: [],
				total: 0,
				limit: 20,
				offset: 0
			} as any);

			await load({
				locals: mockLocals(true),
				url: new URL('http://localhost/connectors?name_contains=test-connector'),
				fetch: vi.fn()
			} as any);

			expect(listConnectors).toHaveBeenCalledWith(
				expect.objectContaining({ name_contains: 'test-connector' }),
				'tok',
				'tid',
				expect.any(Function)
			);
		});

		it('passes connector_type filter through when provided', async () => {
			vi.mocked(hasAdminRole).mockReturnValue(true);
			vi.mocked(listConnectors).mockResolvedValue({
				items: [],
				total: 0,
				limit: 20,
				offset: 0
			} as any);

			await load({
				locals: mockLocals(true),
				url: new URL('http://localhost/connectors?connector_type=database'),
				fetch: vi.fn()
			} as any);

			expect(listConnectors).toHaveBeenCalledWith(
				expect.objectContaining({ connector_type: 'database' }),
				'tok',
				'tid',
				expect.any(Function)
			);
		});

		it('passes status filter through when provided', async () => {
			vi.mocked(hasAdminRole).mockReturnValue(true);
			vi.mocked(listConnectors).mockResolvedValue({
				items: [],
				total: 0,
				limit: 20,
				offset: 0
			} as any);

			await load({
				locals: mockLocals(true),
				url: new URL('http://localhost/connectors?status=error'),
				fetch: vi.fn()
			} as any);

			expect(listConnectors).toHaveBeenCalledWith(
				expect.objectContaining({ status: 'error' }),
				'tok',
				'tid',
				expect.any(Function)
			);
		});
	});
});

describe('Connectors +page.svelte', () => {
	it('is defined as a module', async () => {
		const mod = await import('./+page.svelte');
		expect(mod.default).toBeDefined();
	});

	it('is a valid Svelte component constructor', async () => {
		const mod = await import('./+page.svelte');
		expect(typeof mod.default).toBe('function');
	});
});
