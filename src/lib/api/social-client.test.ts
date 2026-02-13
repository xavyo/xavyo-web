import { vi, describe, it, expect, beforeEach } from 'vitest';

function mockResponse(data: unknown, ok = true, status = 200) {
	return {
		ok,
		status,
		json: () => Promise.resolve(data)
	};
}

describe('social-client', () => {
	const mockFetch = vi.fn();

	beforeEach(() => {
		mockFetch.mockReset();
		vi.resetModules();
	});

	describe('listSocialProviders', () => {
		it('fetches from /api/federation/social/providers', async () => {
			const data = { providers: [{ provider: 'google', enabled: true }], total: 1 };
			mockFetch.mockResolvedValueOnce(mockResponse(data));
			const { listSocialProviders } = await import('./social-client');

			const result = await listSocialProviders(mockFetch);

			expect(mockFetch).toHaveBeenCalledWith('/api/federation/social/providers');
			expect(result).toEqual(data);
		});

		it('throws on non-ok response', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null, false, 500));
			const { listSocialProviders } = await import('./social-client');

			await expect(listSocialProviders(mockFetch)).rejects.toThrow(
				'Failed to fetch social providers: 500'
			);
		});
	});

	describe('updateSocialProvider', () => {
		it('sends PUT to /api/federation/social/providers/:provider with body', async () => {
			const updateData = { enabled: true, client_id: 'new-id', client_secret: 'new-secret' };
			const responseData = { provider: 'google', enabled: true, client_id: 'new-id' };
			mockFetch.mockResolvedValueOnce(mockResponse(responseData));
			const { updateSocialProvider } = await import('./social-client');

			const result = await updateSocialProvider('google', updateData, mockFetch);

			expect(mockFetch).toHaveBeenCalledWith('/api/federation/social/providers/google', {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(updateData)
			});
			expect(result).toEqual(responseData);
		});

		it('throws on non-ok response', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null, false, 400));
			const { updateSocialProvider } = await import('./social-client');

			await expect(
				updateSocialProvider('google', { enabled: true }, mockFetch)
			).rejects.toThrow('Failed to update social provider: 400');
		});
	});

	describe('deleteSocialProvider', () => {
		it('sends DELETE to /api/federation/social/providers/:provider', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null, true, 204));
			const { deleteSocialProvider } = await import('./social-client');

			await deleteSocialProvider('github', mockFetch);

			expect(mockFetch).toHaveBeenCalledWith('/api/federation/social/providers/github', {
				method: 'DELETE'
			});
		});

		it('throws on non-ok response', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null, false, 404));
			const { deleteSocialProvider } = await import('./social-client');

			await expect(deleteSocialProvider('bad', mockFetch)).rejects.toThrow(
				'Failed to delete social provider: 404'
			);
		});
	});

	describe('listSocialConnections', () => {
		it('fetches from /api/federation/social/connections', async () => {
			const data = {
				connections: [{ provider: 'google', email: 'user@gmail.com' }]
			};
			mockFetch.mockResolvedValueOnce(mockResponse(data));
			const { listSocialConnections } = await import('./social-client');

			const result = await listSocialConnections(mockFetch);

			expect(mockFetch).toHaveBeenCalledWith('/api/federation/social/connections');
			expect(result).toEqual(data);
		});

		it('throws on non-ok response', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null, false, 401));
			const { listSocialConnections } = await import('./social-client');

			await expect(listSocialConnections(mockFetch)).rejects.toThrow(
				'Failed to fetch social connections: 401'
			);
		});
	});

	describe('unlinkSocialAccount', () => {
		it('sends DELETE to /api/federation/social/unlink/:provider', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null, true, 204));
			const { unlinkSocialAccount } = await import('./social-client');

			await unlinkSocialAccount('google', mockFetch);

			expect(mockFetch).toHaveBeenCalledWith('/api/federation/social/unlink/google', {
				method: 'DELETE'
			});
		});

		it('throws on non-ok response', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null, false, 404));
			const { unlinkSocialAccount } = await import('./social-client');

			await expect(unlinkSocialAccount('bad', mockFetch)).rejects.toThrow(
				'Failed to unlink social account: 404'
			);
		});
	});

	describe('initiateSocialLink', () => {
		it('sets window.location.href to the authorize URL', async () => {
			const locationDescriptor = Object.getOwnPropertyDescriptor(window, 'location');
			let hrefValue = '';
			Object.defineProperty(window, 'location', {
				value: { href: '' },
				writable: true,
				configurable: true
			});
			Object.defineProperty(window.location, 'href', {
				get: () => hrefValue,
				set: (v: string) => {
					hrefValue = v;
				},
				configurable: true
			});

			const { initiateSocialLink } = await import('./social-client');

			initiateSocialLink('google');

			expect(hrefValue).toBe('/api/federation/social/link/google/authorize');

			// Restore original location
			if (locationDescriptor) {
				Object.defineProperty(window, 'location', locationDescriptor);
			}
		});
	});
});
