import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockEnv = vi.hoisted(() => ({
	API_BASE_URL: 'http://localhost:8080/'
}));

vi.mock('$env/dynamic/private', () => ({
	env: mockEnv
}));

vi.mock('$lib/api/oauth-clients', () => ({
	listOAuthClients: vi.fn()
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

import { listOAuthClients } from '$lib/api/oauth-clients';
import { ApiError } from '$lib/api/client';

const mockLocals = () => ({
	accessToken: 'tok',
	tenantId: 'tid',
	user: { roles: ['admin'] }
});

const makeClient = (overrides: Record<string, unknown> = {}) => ({
	id: 'client-1',
	name: 'Test App',
	client_id: 'cid',
	client_type: 'confidential',
	grant_types: ['authorization_code'],
	scopes: ['openid'],
	redirect_uris: ['https://app.example.com/callback'],
	post_logout_redirect_uris: [],
	is_active: true,
	created_at: '2026-01-01T00:00:00Z',
	updated_at: '2026-01-01T00:00:00Z',
	...overrides
});

describe('OAuth Clients Admin +page.server', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mockEnv.API_BASE_URL = 'http://localhost:8080/';
	});

	describe('load', () => {
		let load: any;

		beforeEach(async () => {
			const mod = await import('./+page.server');
			load = mod.load;
		});

		it('returns clients with issuer and discovery URLs (trailing slash stripped)', async () => {
			vi.mocked(listOAuthClients).mockResolvedValue({
				clients: [makeClient()],
				total: 1
			} as any);

			const result = await load({
				locals: mockLocals(),
				fetch: vi.fn()
			} as any);

			expect(result.clients).toHaveLength(1);
			expect(result.total).toBe(1);
			expect(result.issuerUrl).toBe('http://localhost:8080');
			expect(result.discoveryUrl).toBe(
				'http://localhost:8080/.well-known/openid-configuration'
			);
			expect(result.discoveryUrl).toMatch(/\/\.well-known\/openid-configuration$/);
		});

		it('returns null issuer and discovery when API_BASE_URL is empty', async () => {
			mockEnv.API_BASE_URL = '';
			vi.mocked(listOAuthClients).mockResolvedValue({
				clients: [],
				total: 0
			} as any);

			const result = await load({
				locals: mockLocals(),
				fetch: vi.fn()
			} as any);

			expect(result.issuerUrl).toBeNull();
			expect(result.discoveryUrl).toBeNull();
		});

		it('fails closed when API throws', async () => {
			vi.mocked(listOAuthClients).mockRejectedValue(new Error('Network error'));

			try {
				await load({
					locals: mockLocals(),
					fetch: vi.fn()
				} as any);
				expect.fail('should have thrown');
			} catch (e: any) {
				expect(e.status).toBe(500);
			}
		});

		it('propagates ApiError status', async () => {
			vi.mocked(listOAuthClients).mockRejectedValue(new ApiError('Forbidden', 403));

			try {
				await load({
					locals: mockLocals(),
					fetch: vi.fn()
				} as any);
				expect.fail('should have thrown');
			} catch (e: any) {
				expect(e.status).toBe(403);
			}
		});
	});
});
