import { vi, describe, it, expect, beforeEach } from 'vitest';

function mockResponse(data: unknown, ok = true, status = 200) {
	return {
		ok,
		status,
		json: () => Promise.resolve(data)
	};
}

describe('invitations-client', () => {
	const mockFetch = vi.fn();

	beforeEach(() => {
		mockFetch.mockReset();
		vi.resetModules();
	});

	describe('fetchInvitations', () => {
		it('fetches from /api/invitations with no params', async () => {
			const data = { invitations: [], total: 0, limit: 20, offset: 0 };
			mockFetch.mockResolvedValueOnce(mockResponse(data));
			const { fetchInvitations } = await import('./invitations-client');

			const result = await fetchInvitations({}, mockFetch);

			expect(mockFetch).toHaveBeenCalledWith('/api/invitations');
			expect(result).toEqual(data);
		});

		it('includes query params in URL', async () => {
			mockFetch.mockResolvedValueOnce(
				mockResponse({ invitations: [], total: 0, limit: 10, offset: 0 })
			);
			const { fetchInvitations } = await import('./invitations-client');

			await fetchInvitations(
				{ status: 'pending', email: 'user@example.com', limit: 10, offset: 5 },
				mockFetch
			);

			const calledUrl = mockFetch.mock.calls[0][0] as string;
			expect(calledUrl).toContain('status=pending');
			expect(calledUrl).toContain('email=user%40example.com');
			expect(calledUrl).toContain('limit=10');
			expect(calledUrl).toContain('offset=5');
		});

		it('throws on non-ok response', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null, false, 500));
			const { fetchInvitations } = await import('./invitations-client');

			await expect(fetchInvitations({}, mockFetch)).rejects.toThrow(
				'Failed to fetch invitations: 500'
			);
		});
	});

	describe('createInvitationClient', () => {
		it('sends POST to /api/invitations with body', async () => {
			const created = {
				id: 'inv-1',
				email: 'new@example.com',
				status: 'pending',
				created_at: '2026-01-01'
			};
			mockFetch.mockResolvedValueOnce(mockResponse(created));
			const { createInvitationClient } = await import('./invitations-client');

			const body = { email: 'new@example.com', role: 'member' };
			const result = await createInvitationClient(body, mockFetch);

			expect(mockFetch).toHaveBeenCalledWith('/api/invitations', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(body)
			});
			expect(result).toEqual(created);
		});

		it('throws on non-ok response', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null, false, 400));
			const { createInvitationClient } = await import('./invitations-client');

			await expect(
				createInvitationClient({ email: 'bad@example.com' }, mockFetch)
			).rejects.toThrow('Failed to create invitation: 400');
		});
	});

	describe('resendInvitationClient', () => {
		it('sends POST to /api/invitations/:id/resend', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null));
			const { resendInvitationClient } = await import('./invitations-client');

			await resendInvitationClient('inv-1', mockFetch);

			expect(mockFetch).toHaveBeenCalledWith('/api/invitations/inv-1/resend', {
				method: 'POST'
			});
		});

		it('throws on non-ok response', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null, false, 404));
			const { resendInvitationClient } = await import('./invitations-client');

			await expect(resendInvitationClient('bad-id', mockFetch)).rejects.toThrow(
				'Failed to resend invitation: 404'
			);
		});
	});

	describe('cancelInvitationClient', () => {
		it('sends DELETE to /api/invitations/:id', async () => {
			const data = { id: 'inv-1', status: 'cancelled', cancelled_at: '2026-01-01' };
			mockFetch.mockResolvedValueOnce(mockResponse(data));
			const { cancelInvitationClient } = await import('./invitations-client');

			const result = await cancelInvitationClient('inv-1', mockFetch);

			expect(mockFetch).toHaveBeenCalledWith('/api/invitations/inv-1', {
				method: 'DELETE'
			});
			expect(result).toEqual(data);
		});

		it('throws on non-ok response', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null, false, 400));
			const { cancelInvitationClient } = await import('./invitations-client');

			await expect(cancelInvitationClient('inv-1', mockFetch)).rejects.toThrow(
				'Failed to cancel invitation: 400'
			);
		});
	});
});
