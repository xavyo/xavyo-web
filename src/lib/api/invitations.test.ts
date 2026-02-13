import { describe, it, expect, vi, beforeEach } from 'vitest';
import { listInvitations, createInvitation, resendInvitation, cancelInvitation } from './invitations';

vi.mock('./client', () => ({
	apiClient: vi.fn(),
	ApiError: class ApiError extends Error {
		status: number;
		constructor(message: string, status: number) {
			super(message);
			this.status = status;
		}
	}
}));

import { apiClient } from './client';

const mockApiClient = vi.mocked(apiClient);

describe('Invitations API', () => {
	const mockFetch = vi.fn();
	const token = 'test-token';
	const tenantId = 'test-tenant';

	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe('listInvitations', () => {
		it('calls GET /admin/invitations with no params', async () => {
			const mockResponse = { invitations: [], total: 0, limit: 20, offset: 0 };
			mockApiClient.mockResolvedValue(mockResponse);

			const result = await listInvitations({}, token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith('/admin/invitations', {
				method: 'GET',
				token,
				tenantId,
				fetch: mockFetch
			});
			expect(result).toEqual(mockResponse);
		});

		it('includes status filter in query string', async () => {
			mockApiClient.mockResolvedValue({ invitations: [], total: 0, limit: 20, offset: 0 });

			await listInvitations({ status: 'pending' }, token, tenantId, mockFetch);

			const calledPath = (mockApiClient.mock.calls[0] as unknown[])[0] as string;
			const params = new URLSearchParams(calledPath.split('?')[1]);
			expect(params.get('status')).toBe('pending');
		});

		it('includes email filter in query string', async () => {
			mockApiClient.mockResolvedValue({ invitations: [], total: 0, limit: 20, offset: 0 });

			await listInvitations({ email: 'user@example.com' }, token, tenantId, mockFetch);

			const calledPath = (mockApiClient.mock.calls[0] as unknown[])[0] as string;
			const params = new URLSearchParams(calledPath.split('?')[1]);
			expect(params.get('email')).toBe('user@example.com');
		});

		it('includes pagination params in query string', async () => {
			mockApiClient.mockResolvedValue({ invitations: [], total: 0, limit: 10, offset: 20 });

			await listInvitations({ limit: 10, offset: 20 }, token, tenantId, mockFetch);

			const calledPath = (mockApiClient.mock.calls[0] as unknown[])[0] as string;
			const params = new URLSearchParams(calledPath.split('?')[1]);
			expect(params.get('limit')).toBe('10');
			expect(params.get('offset')).toBe('20');
		});

		it('includes all params together in query string', async () => {
			mockApiClient.mockResolvedValue({ invitations: [], total: 0, limit: 10, offset: 0 });

			await listInvitations(
				{ status: 'expired', email: 'test@example.com', limit: 10, offset: 5 },
				token,
				tenantId,
				mockFetch
			);

			const calledPath = (mockApiClient.mock.calls[0] as unknown[])[0] as string;
			const params = new URLSearchParams(calledPath.split('?')[1]);
			expect(params.get('status')).toBe('expired');
			expect(params.get('email')).toBe('test@example.com');
			expect(params.get('limit')).toBe('10');
			expect(params.get('offset')).toBe('5');
		});
	});

	describe('createInvitation', () => {
		it('calls POST /admin/invitations with body', async () => {
			const body = {
				email: 'newuser@example.com',
				role: 'member'
			};
			const mockInvitation = {
				id: 'inv-1',
				email: 'newuser@example.com',
				role: 'member',
				status: 'pending',
				created_at: '2026-01-01T00:00:00Z'
			};
			mockApiClient.mockResolvedValue(mockInvitation);

			const result = await createInvitation(body, token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith('/admin/invitations', {
				method: 'POST',
				token,
				tenantId,
				body,
				fetch: mockFetch
			});
			expect(result.id).toBe('inv-1');
		});
	});

	describe('resendInvitation', () => {
		it('calls POST /admin/invitations/:id/resend', async () => {
			mockApiClient.mockResolvedValue(undefined);

			await resendInvitation('inv-1', token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith('/admin/invitations/inv-1/resend', {
				method: 'POST',
				token,
				tenantId,
				fetch: mockFetch
			});
		});
	});

	describe('cancelInvitation', () => {
		it('calls DELETE /admin/invitations/:id', async () => {
			const mockInvitation = {
				id: 'inv-1',
				email: 'user@example.com',
				status: 'cancelled',
				cancelled_at: '2026-01-01T00:00:00Z'
			};
			mockApiClient.mockResolvedValue(mockInvitation);

			const result = await cancelInvitation('inv-1', token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith('/admin/invitations/inv-1', {
				method: 'DELETE',
				token,
				tenantId,
				fetch: mockFetch
			});
			expect(result).toEqual(mockInvitation);
		});
	});
});
