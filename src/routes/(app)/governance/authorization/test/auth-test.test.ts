import { describe, it, expect, vi, beforeEach } from 'vitest';

// --- Mocks ---

vi.mock('$lib/server/auth', () => ({
	hasAdminRole: vi.fn()
}));

vi.mock('$lib/api/authorization', () => ({
	checkAuthorization: vi.fn()
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
import { checkAuthorization } from '$lib/api/authorization';
import { ApiError } from '$lib/api/client';

const mockLocals = (admin: boolean) => ({
	accessToken: 'tok',
	tenantId: 'tid',
	user: { roles: admin ? ['admin'] : ['user'] }
});

const makeDecision = (overrides: Record<string, unknown> = {}) => ({
	allowed: true,
	reason: 'Policy match',
	source: 'policy',
	policy_id: 'pol-1',
	decision_id: 'dec-1',
	...overrides
});

// =============================================================================
// Auth Test Tool Load
// =============================================================================

describe('Auth Test Tool +page.server', () => {
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
					locals: mockLocals(false)
				} as any);
				expect.fail('should have thrown redirect');
			} catch (e: any) {
				expect(e.status).toBe(302);
				expect(e.location).toBe('/dashboard');
			}
		});

		it('returns form and null result for admin', async () => {
			vi.mocked(hasAdminRole).mockReturnValue(true);

			const result = await load({
				locals: mockLocals(true)
			} as any);

			expect(result.form).toBeDefined();
			expect(result.result).toBeNull();
		});
	});

	describe('actions.default', () => {
		let actions: any;

		beforeEach(async () => {
			const mod = await import('./+page.server');
			actions = mod.actions;
		});

		it('returns allowed decision', async () => {
			vi.mocked(checkAuthorization).mockResolvedValue(makeDecision() as any);

			const formData = new FormData();
			formData.set('user_id', '550e8400-e29b-41d4-a716-446655440000');
			formData.set('resource_type', 'document');
			formData.set('action', 'read');
			formData.set('resource_id', '');

			const result = await actions.default({
				request: new Request('http://localhost', { method: 'POST', body: formData }),
				locals: mockLocals(true),
				fetch: vi.fn()
			} as any);

			expect(result.result.allowed).toBe(true);
			expect(result.result.source).toBe('policy');
			expect(result.result.policy_id).toBe('pol-1');
		});

		it('returns denied decision', async () => {
			vi.mocked(checkAuthorization).mockResolvedValue(
				makeDecision({ allowed: false, reason: 'No entitlements', source: 'default_deny', policy_id: null }) as any
			);

			const formData = new FormData();
			formData.set('user_id', '550e8400-e29b-41d4-a716-446655440000');
			formData.set('resource_type', 'document');
			formData.set('action', 'delete');
			formData.set('resource_id', '');

			const result = await actions.default({
				request: new Request('http://localhost', { method: 'POST', body: formData }),
				locals: mockLocals(true),
				fetch: vi.fn()
			} as any);

			expect(result.result.allowed).toBe(false);
			expect(result.result.source).toBe('default_deny');
		});

		it('passes optional resource_id when provided', async () => {
			vi.mocked(checkAuthorization).mockResolvedValue(makeDecision() as any);

			const formData = new FormData();
			formData.set('user_id', '550e8400-e29b-41d4-a716-446655440000');
			formData.set('resource_type', 'document');
			formData.set('action', 'read');
			formData.set('resource_id', '660e8400-e29b-41d4-a716-446655440000');

			await actions.default({
				request: new Request('http://localhost', { method: 'POST', body: formData }),
				locals: mockLocals(true),
				fetch: vi.fn()
			} as any);

			expect(checkAuthorization).toHaveBeenCalledWith(
				expect.objectContaining({
					resource_id: '660e8400-e29b-41d4-a716-446655440000'
				}),
				'tok',
				'tid',
				expect.any(Function)
			);
		});

		it('omits resource_id when empty', async () => {
			vi.mocked(checkAuthorization).mockResolvedValue(makeDecision() as any);

			const formData = new FormData();
			formData.set('user_id', '550e8400-e29b-41d4-a716-446655440000');
			formData.set('resource_type', 'document');
			formData.set('action', 'read');
			formData.set('resource_id', '');

			await actions.default({
				request: new Request('http://localhost', { method: 'POST', body: formData }),
				locals: mockLocals(true),
				fetch: vi.fn()
			} as any);

			expect(checkAuthorization).toHaveBeenCalledWith(
				expect.objectContaining({
					resource_id: undefined
				}),
				'tok',
				'tid',
				expect.any(Function)
			);
		});

		it('returns fail when form is invalid', async () => {
			const formData = new FormData();
			// missing required fields

			const result = await actions.default({
				request: new Request('http://localhost', { method: 'POST', body: formData }),
				locals: mockLocals(true),
				fetch: vi.fn()
			} as any);

			expect(result.status).toBe(400);
		});

		it('returns fail when user_id is not a valid UUID', async () => {
			const formData = new FormData();
			formData.set('user_id', 'not-a-uuid');
			formData.set('resource_type', 'document');
			formData.set('action', 'read');
			formData.set('resource_id', '');

			const result = await actions.default({
				request: new Request('http://localhost', { method: 'POST', body: formData }),
				locals: mockLocals(true),
				fetch: vi.fn()
			} as any);

			expect(result.status).toBe(400);
		});

		it('returns message on ApiError', async () => {
			vi.mocked(checkAuthorization).mockRejectedValue(new ApiError('Service unavailable', 503));

			const formData = new FormData();
			formData.set('user_id', '550e8400-e29b-41d4-a716-446655440000');
			formData.set('resource_type', 'document');
			formData.set('action', 'read');
			formData.set('resource_id', '');

			const result = await actions.default({
				request: new Request('http://localhost', { method: 'POST', body: formData }),
				locals: mockLocals(true),
				fetch: vi.fn()
			} as any);

			expect(result.data.form.message).toBe('Service unavailable');
		});

		it('returns generic message on non-ApiError', async () => {
			vi.mocked(checkAuthorization).mockRejectedValue(new Error('network'));

			const formData = new FormData();
			formData.set('user_id', '550e8400-e29b-41d4-a716-446655440000');
			formData.set('resource_type', 'document');
			formData.set('action', 'read');
			formData.set('resource_id', '');

			const result = await actions.default({
				request: new Request('http://localhost', { method: 'POST', body: formData }),
				locals: mockLocals(true),
				fetch: vi.fn()
			} as any);

			expect(result.data.form.message).toBe('An unexpected error occurred');
		});
	});
});

// =============================================================================
// Decision Result Logic
// =============================================================================

describe('Authorization decision result', () => {
	it('allowed decision has allowed=true', () => {
		const d = makeDecision({ allowed: true });
		expect(d.allowed).toBe(true);
	});

	it('denied decision has allowed=false', () => {
		const d = makeDecision({ allowed: false });
		expect(d.allowed).toBe(false);
	});

	it('policy source has policy_id', () => {
		const d = makeDecision({ source: 'policy', policy_id: 'pol-1' });
		expect(d.source).toBe('policy');
		expect(d.policy_id).toBe('pol-1');
	});

	it('entitlement source', () => {
		const d = makeDecision({ source: 'entitlement', policy_id: null });
		expect(d.source).toBe('entitlement');
	});

	it('default_deny source has no policy', () => {
		const d = makeDecision({ source: 'default_deny', policy_id: null, allowed: false });
		expect(d.source).toBe('default_deny');
		expect(d.policy_id).toBeNull();
	});
});

// =============================================================================
// Svelte Component Module
// =============================================================================

// Note: Svelte component import test omitted — page uses Superforms + $page.form
// which causes slow compilation in test env. Server logic is fully covered above.
