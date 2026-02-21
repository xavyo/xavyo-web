import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/server/auth', () => ({
	hasAdminRole: vi.fn()
}));

vi.mock('$lib/api/invitations', () => ({
	createInvitation: vi.fn()
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

import { load, actions } from './+page.server';
import { hasAdminRole } from '$lib/server/auth';
import { createInvitation } from '$lib/api/invitations';
import { ApiError } from '$lib/api/client';

const mockLocals = (admin: boolean) => ({
	accessToken: 'tok',
	tenantId: 'tid',
	user: { roles: admin ? ['admin'] : ['user'] }
});

function makeFormData(data: Record<string, string>): Request {
	const formData = new URLSearchParams();
	for (const [k, v] of Object.entries(data)) {
		formData.set(k, v);
	}
	return new Request('http://localhost/invitations/create', {
		method: 'POST',
		headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
		body: formData.toString()
	});
}

describe('Invitations Create +page.server', () => {
	beforeEach(() => {
		vi.resetAllMocks();
	});

	describe('load', () => {
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

		it('returns form for admin users', async () => {
			vi.mocked(hasAdminRole).mockReturnValue(true);
			const result: any = await load({
				locals: mockLocals(true)
			} as any);
			expect(result.form).toBeDefined();
		});
	});

	describe('default action', () => {
		it('exports default action', () => {
			expect(actions).toBeDefined();
			expect(actions.default).toBeDefined();
		});

		it('returns validation error for missing email', async () => {
			const result: any = await actions.default({
				request: makeFormData({ email: '' }),
				locals: mockLocals(true),
				fetch: vi.fn()
			} as any);
			expect(result.status).toBe(400);
		});

		it('returns validation error for invalid email format', async () => {
			const result: any = await actions.default({
				request: makeFormData({ email: 'not-an-email' }),
				locals: mockLocals(true),
				fetch: vi.fn()
			} as any);
			expect(result.status).toBe(400);
		});

		it('calls createInvitation and redirects on success', async () => {
			vi.mocked(createInvitation).mockResolvedValue({} as any);
			try {
				await actions.default({
					request: makeFormData({ email: 'user@example.com' }),
					locals: mockLocals(true),
					fetch: vi.fn()
				} as any);
				expect.fail('should have thrown redirect');
			} catch (e: any) {
				expect(e.status).toBe(302);
				expect(e.location).toBe('/invitations');
			}
			expect(createInvitation).toHaveBeenCalledWith(
				{ email: 'user@example.com', role: 'member' },
				'tok',
				'tid',
				expect.any(Function)
			);
		});

		it('returns API error message on failure', async () => {
			vi.mocked(createInvitation).mockRejectedValue(
				new ApiError('Invitation already sent', 409)
			);
			const result: any = await actions.default({
				request: makeFormData({ email: 'dup@example.com' }),
				locals: mockLocals(true),
				fetch: vi.fn()
			} as any);
			expect(result.status).toBe(409);
		});

		it('returns generic error for non-API errors', async () => {
			vi.mocked(createInvitation).mockRejectedValue(new Error('network error'));
			const result: any = await actions.default({
				request: makeFormData({ email: 'fail@example.com' }),
				locals: mockLocals(true),
				fetch: vi.fn()
			} as any);
			expect(result.status).toBe(500);
		});
	});
});

describe('Invitations Create +page.svelte', () => {
	it('page component is defined', async () => {
		const mod = await import('./+page.svelte');
		expect(mod.default).toBeDefined();
	});
});
