import { describe, it, expect, vi, beforeEach } from 'vitest';
import { hasAdminRole } from '$lib/server/auth';

/**
 * Tenant isolation verification tests.
 *
 * These tests codify the defence-in-depth pattern:
 * - BFF routes check hasAdminRole + require tenantId/accessToken
 * - Every API client function passes tenantId to apiClient
 * - The backend enforces SQL WHERE tenant_id = $X + RLS
 *
 * The BFF route guards and backend SQL are not unit-testable here,
 * but the hasAdminRole guard and API client tenantId plumbing are.
 */
describe('federation tenant isolation', () => {
	describe('hasAdminRole guard (imported from $lib/server/auth)', () => {
		it('rejects undefined roles', () => {
			expect(hasAdminRole(undefined)).toBe(false);
		});

		it('rejects empty roles array', () => {
			expect(hasAdminRole([])).toBe(false);
		});

		it('rejects non-admin roles', () => {
			expect(hasAdminRole(['user'])).toBe(false);
			expect(hasAdminRole(['viewer'])).toBe(false);
			expect(hasAdminRole(['editor', 'viewer'])).toBe(false);
		});

		it('accepts admin role', () => {
			expect(hasAdminRole(['admin'])).toBe(true);
		});

		it('accepts super_admin role', () => {
			expect(hasAdminRole(['super_admin'])).toBe(true);
		});

		it('accepts admin among other roles', () => {
			expect(hasAdminRole(['user', 'admin'])).toBe(true);
		});

		it('accepts super_admin among other roles', () => {
			expect(hasAdminRole(['user', 'super_admin'])).toBe(true);
		});
	});

	describe('cross-tenant API client isolation', () => {
		// The existing federation.test.ts already verifies each function
		// calls apiClient with the correct tenantId. This test specifically
		// verifies that different tenantIds produce distinct calls —
		// the property that matters for isolation.

		vi.mock('$lib/api/client', () => ({
			apiClient: vi.fn(),
			ApiError: class ApiError extends Error {
				status: number;
				constructor(message: string, status: number) {
					super(message);
					this.status = status;
				}
			}
		}));

		let apiClient: ReturnType<typeof vi.fn>;
		let federation: typeof import('$lib/api/federation');

		beforeEach(async () => {
			vi.clearAllMocks();
			const clientModule = await import('$lib/api/client');
			apiClient = vi.mocked(clientModule.apiClient);
			apiClient.mockResolvedValue({});
			federation = await import('$lib/api/federation');
		});

		const token = 'test-token';
		const tenantA = 'tenant-aaa';
		const tenantB = 'tenant-bbb';
		const mockFetch = vi.fn();

		it('listServiceProviders: tenant A and tenant B produce isolated calls', async () => {
			await federation.listServiceProviders({}, token, tenantA, mockFetch);
			const callA = apiClient.mock.calls[0];

			apiClient.mockClear();
			await federation.listServiceProviders({}, token, tenantB, mockFetch);
			const callB = apiClient.mock.calls[0];

			expect(callA[1].tenantId).toBe(tenantA);
			expect(callB[1].tenantId).toBe(tenantB);
		});

		it('getServiceProvider: tenant A and tenant B produce isolated calls', async () => {
			await federation.getServiceProvider('sp-1', token, tenantA, mockFetch);
			const callA = apiClient.mock.calls[0];

			apiClient.mockClear();
			await federation.getServiceProvider('sp-1', token, tenantB, mockFetch);
			const callB = apiClient.mock.calls[0];

			expect(callA[1].tenantId).toBe(tenantA);
			expect(callB[1].tenantId).toBe(tenantB);
		});

		it('listCertificates: tenant A and tenant B produce isolated calls', async () => {
			await federation.listCertificates(token, tenantA, mockFetch);
			const callA = apiClient.mock.calls[0];

			apiClient.mockClear();
			await federation.listCertificates(token, tenantB, mockFetch);
			const callB = apiClient.mock.calls[0];

			expect(callA[1].tenantId).toBe(tenantA);
			expect(callB[1].tenantId).toBe(tenantB);
		});

		it('listIdentityProviders: tenant A and tenant B produce isolated calls', async () => {
			await federation.listIdentityProviders({}, token, tenantA, mockFetch);
			const callA = apiClient.mock.calls[0];

			apiClient.mockClear();
			await federation.listIdentityProviders({}, token, tenantB, mockFetch);
			const callB = apiClient.mock.calls[0];

			expect(callA[1].tenantId).toBe(tenantA);
			expect(callB[1].tenantId).toBe(tenantB);
		});
	});
});
