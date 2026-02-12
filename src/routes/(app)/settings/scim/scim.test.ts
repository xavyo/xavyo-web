import { describe, it, expect, vi, beforeEach } from 'vitest';

// --- Mocks ---

vi.mock('$lib/server/auth', () => ({
	hasAdminRole: vi.fn()
}));

vi.mock('$lib/api/scim', () => ({
	listScimTokens: vi.fn(),
	createScimToken: vi.fn(),
	revokeScimToken: vi.fn(),
	listScimMappings: vi.fn(),
	updateScimMappings: vi.fn()
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

import { hasAdminRole } from '$lib/server/auth';
import {
	listScimTokens,
	createScimToken,
	revokeScimToken,
	listScimMappings,
	updateScimMappings
} from '$lib/api/scim';
import { ApiError } from '$lib/api/client';

const mockLocals = (admin: boolean) => ({
	accessToken: 'tok',
	tenantId: 'tid',
	user: { roles: admin ? ['admin'] : ['user'] }
});

const makeToken = (overrides: Record<string, unknown> = {}) => ({
	id: 'tok-1',
	name: 'Test Token',
	token_prefix: 'xavyo_',
	created_at: '2026-01-01T00:00:00Z',
	last_used_at: null,
	revoked_at: null,
	created_by: 'user-1',
	...overrides
});

const makeMapping = (overrides: Record<string, unknown> = {}) => ({
	id: 'map-1',
	tenant_id: 'tid',
	scim_path: 'userName',
	xavyo_field: 'email',
	transform: null,
	required: true,
	created_at: '2026-01-01T00:00:00Z',
	updated_at: '2026-01-01T00:00:00Z',
	...overrides
});

// =============================================================================
// SCIM Admin Page (+page.server.ts)
// =============================================================================

describe('SCIM Admin +page.server', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe('load', () => {
		let load: any;

		beforeEach(async () => {
			const mod = await import('./+page.server');
			load = mod.load;
		});

		it('redirects non-admin users', async () => {
			vi.mocked(hasAdminRole).mockReturnValue(false);
			try {
				await load({
					locals: mockLocals(false),
					fetch: vi.fn()
				} as any);
				expect.fail('should have thrown redirect');
			} catch (e: any) {
				expect(e.status).toBe(302);
				expect(e.location).toBe('/dashboard');
			}
		});

		it('returns tokens and mappings for admin users', async () => {
			vi.mocked(hasAdminRole).mockReturnValue(true);
			vi.mocked(listScimTokens).mockResolvedValue([makeToken()] as any);
			vi.mocked(listScimMappings).mockResolvedValue([makeMapping()] as any);

			const result = await load({
				locals: mockLocals(true),
				fetch: vi.fn()
			} as any);

			expect(result.form).toBeDefined();
			expect(result.tokens).toHaveLength(1);
			expect(result.tokens[0].id).toBe('tok-1');
			expect(result.mappings).toHaveLength(1);
			expect(result.mappings[0].scim_path).toBe('userName');
		});

		it('returns empty arrays when API throws', async () => {
			vi.mocked(hasAdminRole).mockReturnValue(true);
			vi.mocked(listScimTokens).mockRejectedValue(new Error('Network error'));
			vi.mocked(listScimMappings).mockRejectedValue(new Error('Network error'));

			const result = await load({
				locals: mockLocals(true),
				fetch: vi.fn()
			} as any);

			expect(result.tokens).toEqual([]);
			expect(result.mappings).toEqual([]);
			expect(result.form).toBeDefined();
		});
	});

	describe('actions.createToken', () => {
		let actions: any;

		beforeEach(async () => {
			const mod = await import('./+page.server');
			actions = mod.actions;
		});

		it('returns created token with raw value', async () => {
			vi.mocked(createScimToken).mockResolvedValue({
				id: 'tok-new',
				name: 'New Token',
				token: 'xavyo_abc123secret',
				created_at: '2026-02-01T00:00:00Z',
				warning: 'Store this token securely'
			} as any);

			const formData = new FormData();
			formData.set('name', 'New Token');

			const result = await actions.createToken({
				request: new Request('http://localhost/settings/scim?/createToken', {
					method: 'POST',
					body: formData
				}),
				locals: mockLocals(true),
				fetch: vi.fn()
			} as any);

			expect(result.tokenCreated).toBe(true);
			expect(result.createdToken.token).toBe('xavyo_abc123secret');
			expect(result.createdToken.name).toBe('New Token');
			expect(result.createdToken.id).toBe('tok-new');
		});

		it('returns validation error with empty name', async () => {
			const formData = new FormData();
			formData.set('name', '');

			const result = await actions.createToken({
				request: new Request('http://localhost/settings/scim?/createToken', {
					method: 'POST',
					body: formData
				}),
				locals: mockLocals(true),
				fetch: vi.fn()
			} as any);

			expect(result.status).toBe(400);
		});

		it('returns error message on ApiError', async () => {
			vi.mocked(createScimToken).mockRejectedValue(new ApiError('Duplicate token name', 409));

			const formData = new FormData();
			formData.set('name', 'Dup Token');

			const result = await actions.createToken({
				request: new Request('http://localhost/settings/scim?/createToken', {
					method: 'POST',
					body: formData
				}),
				locals: mockLocals(true),
				fetch: vi.fn()
			} as any);

			expect(result.data.form.message).toBe('Duplicate token name');
		});
	});

	describe('actions.revokeToken', () => {
		let actions: any;

		beforeEach(async () => {
			const mod = await import('./+page.server');
			actions = mod.actions;
		});

		it('calls revokeScimToken and returns success', async () => {
			vi.mocked(revokeScimToken).mockResolvedValue(null);

			const formData = new FormData();
			formData.set('id', 'tok-1');

			const result = await actions.revokeToken({
				request: new Request('http://localhost/settings/scim?/revokeToken', {
					method: 'POST',
					body: formData
				}),
				locals: mockLocals(true),
				fetch: vi.fn()
			} as any);

			expect(revokeScimToken).toHaveBeenCalledWith('tok-1', 'tok', 'tid', expect.any(Function));
			expect(result.success).toBe(true);
			expect(result.action).toBe('revoked');
		});

		it('returns error on ApiError', async () => {
			vi.mocked(revokeScimToken).mockRejectedValue(new ApiError('Token not found', 404));

			const formData = new FormData();
			formData.set('id', 'tok-missing');

			const result = await actions.revokeToken({
				request: new Request('http://localhost/settings/scim?/revokeToken', {
					method: 'POST',
					body: formData
				}),
				locals: mockLocals(true),
				fetch: vi.fn()
			} as any);

			expect(result.status).toBe(404);
		});

		it('returns 400 when id is missing', async () => {
			const formData = new FormData();

			const result = await actions.revokeToken({
				request: new Request('http://localhost/settings/scim?/revokeToken', {
					method: 'POST',
					body: formData
				}),
				locals: mockLocals(true),
				fetch: vi.fn()
			} as any);

			expect(result.status).toBe(400);
		});
	});
});

// =============================================================================
// Svelte Component Module
// =============================================================================

describe('SCIM page Svelte component', () => {
	it('page component is defined', async () => {
		const mod = await import('./+page.svelte');
		expect(mod.default).toBeDefined();
	});
});
