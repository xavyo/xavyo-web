import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/server/auth', () => ({
	hasAdminRole: vi.fn()
}));

vi.mock('$lib/api/invitations', () => ({
	listInvitations: vi.fn(),
	resendInvitation: vi.fn(),
	cancelInvitation: vi.fn()
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
import { listInvitations, resendInvitation, cancelInvitation } from '$lib/api/invitations';
import { ApiError } from '$lib/api/client';

const mockLocals = (admin: boolean) => ({
	accessToken: 'tok',
	tenantId: 'tid',
	user: { roles: admin ? ['admin'] : ['user'] }
});

describe('Invitations +page.server', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe('load', () => {
		it('redirects non-admin users', async () => {
			vi.mocked(hasAdminRole).mockReturnValue(false);
			try {
				await load({
					locals: mockLocals(false),
					url: new URL('http://localhost/invitations'),
					fetch: vi.fn()
				} as any);
				expect.fail('should have thrown redirect');
			} catch (e: any) {
				expect(e.status).toBe(302);
				expect(e.location).toBe('/dashboard');
			}
		});

		it('returns invitations for admin users', async () => {
			vi.mocked(hasAdminRole).mockReturnValue(true);
			const mockResponse = {
				invitations: [
					{
						id: 'inv1',
						email: 'test@example.com',
						status: 'sent',
						role_template_id: null,
						invited_by_user_id: 'u1',
						expires_at: '2026-03-01T00:00:00Z',
						created_at: '2026-02-01T00:00:00Z',
						accepted_at: null
					}
				],
				total: 1,
				limit: 20,
				offset: 0
			};
			vi.mocked(listInvitations).mockResolvedValue(mockResponse as any);

			const result = (await load({
				locals: mockLocals(true),
				url: new URL('http://localhost/invitations'),
				fetch: vi.fn()
			} as any)) as any;

			expect(result.invitations).toEqual(mockResponse.invitations);
			expect(result.total).toBe(1);
			expect(result.limit).toBe(20);
			expect(result.offset).toBe(0);
		});

		it('reads pagination and filters from URL searchParams', async () => {
			vi.mocked(hasAdminRole).mockReturnValue(true);
			vi.mocked(listInvitations).mockResolvedValue({
				invitations: [],
				total: 0,
				limit: 10,
				offset: 20
			} as any);

			await load({
				locals: mockLocals(true),
				url: new URL(
					'http://localhost/invitations?offset=20&limit=10&status=sent&email=test@example.com'
				),
				fetch: vi.fn()
			} as any);

			expect(listInvitations).toHaveBeenCalledWith(
				{ status: 'sent', email: 'test@example.com', limit: 10, offset: 20 },
				'tok',
				'tid',
				expect.any(Function)
			);
		});

		it('returns empty array when API throws', async () => {
			vi.mocked(hasAdminRole).mockReturnValue(true);
			vi.mocked(listInvitations).mockRejectedValue(new Error('API error'));

			const result = (await load({
				locals: mockLocals(true),
				url: new URL('http://localhost/invitations'),
				fetch: vi.fn()
			} as any)) as any;

			expect(result.invitations).toEqual([]);
			expect(result.total).toBe(0);
		});

		it('passes status and email filters through to data', async () => {
			vi.mocked(hasAdminRole).mockReturnValue(true);
			vi.mocked(listInvitations).mockResolvedValue({
				invitations: [],
				total: 0,
				limit: 20,
				offset: 0
			} as any);

			const result = (await load({
				locals: mockLocals(true),
				url: new URL('http://localhost/invitations?status=cancelled&email=foo@bar.com'),
				fetch: vi.fn()
			} as any)) as any;

			expect(result.status).toBe('cancelled');
			expect(result.email).toBe('foo@bar.com');
		});
	});

	describe('actions', () => {
		it('resend action calls resendInvitation with correct params', async () => {
			vi.mocked(resendInvitation).mockResolvedValue(undefined);

			const formData = new FormData();
			formData.set('id', 'inv-123');

			const result = await actions.resend({
				request: { formData: () => Promise.resolve(formData) },
				locals: mockLocals(true),
				fetch: vi.fn()
			} as any);

			expect(resendInvitation).toHaveBeenCalledWith(
				'inv-123',
				'tok',
				'tid',
				expect.any(Function)
			);
			expect(result).toEqual({ success: true, action: 'resend' });
		});

		it('resend action returns error when id is missing', async () => {
			const formData = new FormData();

			const result = await actions.resend({
				request: { formData: () => Promise.resolve(formData) },
				locals: mockLocals(true),
				fetch: vi.fn()
			} as any);

			expect(result).toEqual({ success: false, error: 'Missing invitation ID' });
		});

		it('resend action returns error message from ApiError', async () => {
			vi.mocked(resendInvitation).mockRejectedValue(
				new ApiError('Invitation already accepted', 400)
			);

			const formData = new FormData();
			formData.set('id', 'inv-123');

			const result = await actions.resend({
				request: { formData: () => Promise.resolve(formData) },
				locals: mockLocals(true),
				fetch: vi.fn()
			} as any);

			expect(result).toEqual({ success: false, error: 'Invitation already accepted' });
		});

		it('cancel action calls cancelInvitation with correct params', async () => {
			vi.mocked(cancelInvitation).mockResolvedValue({} as any);

			const formData = new FormData();
			formData.set('id', 'inv-456');

			const result = await actions.cancel({
				request: { formData: () => Promise.resolve(formData) },
				locals: mockLocals(true),
				fetch: vi.fn()
			} as any);

			expect(cancelInvitation).toHaveBeenCalledWith(
				'inv-456',
				'tok',
				'tid',
				expect.any(Function)
			);
			expect(result).toEqual({ success: true, action: 'cancel' });
		});

		it('cancel action returns error when id is missing', async () => {
			const formData = new FormData();

			const result = await actions.cancel({
				request: { formData: () => Promise.resolve(formData) },
				locals: mockLocals(true),
				fetch: vi.fn()
			} as any);

			expect(result).toEqual({ success: false, error: 'Missing invitation ID' });
		});

		it('cancel action returns error message from ApiError', async () => {
			vi.mocked(cancelInvitation).mockRejectedValue(
				new ApiError('Invitation not found', 404)
			);

			const formData = new FormData();
			formData.set('id', 'inv-456');

			const result = await actions.cancel({
				request: { formData: () => Promise.resolve(formData) },
				locals: mockLocals(true),
				fetch: vi.fn()
			} as any);

			expect(result).toEqual({ success: false, error: 'Invitation not found' });
		});

		it('cancel action returns generic error for non-ApiError', async () => {
			vi.mocked(cancelInvitation).mockRejectedValue(new Error('network error'));

			const formData = new FormData();
			formData.set('id', 'inv-456');

			const result = await actions.cancel({
				request: { formData: () => Promise.resolve(formData) },
				locals: mockLocals(true),
				fetch: vi.fn()
			} as any);

			expect(result).toEqual({ success: false, error: 'Failed to cancel invitation' });
		});
	});
});

describe('Invitations +page.svelte', () => {
	it('is defined as a module', async () => {
		const mod = await import('./+page.svelte');
		expect(mod.default).toBeDefined();
	});
});
