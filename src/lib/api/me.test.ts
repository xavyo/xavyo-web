import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
	getProfile,
	updateProfile,
	changePassword,
	getSecurityOverview,
	initiateEmailChange,
	verifyEmailChange
} from './me';

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

describe('me API functions', () => {
	const mockFetch = vi.fn();
	const token = 'test-token';
	const tenantId = 'test-tenant';

	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe('getProfile', () => {
		it('calls GET /me/profile', async () => {
			const mockResponse = {
				id: 'user-1',
				email: 'user@example.com',
				display_name: 'Test User',
				first_name: 'Test',
				last_name: 'User',
				avatar_url: null,
				email_verified: true,
				created_at: '2024-01-01T00:00:00Z'
			};
			mockApiClient.mockResolvedValue(mockResponse);

			const result = await getProfile(token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith('/me/profile', {
				method: 'GET',
				token,
				tenantId,
				fetch: mockFetch
			});
			expect(result).toEqual(mockResponse);
		});
	});

	describe('updateProfile', () => {
		it('calls PUT /me/profile with body', async () => {
			const updateData = { display_name: 'New Name', first_name: 'New' };
			const mockResponse = {
				id: 'user-1',
				email: 'user@example.com',
				display_name: 'New Name',
				first_name: 'New',
				last_name: 'User',
				avatar_url: null,
				email_verified: true,
				created_at: '2024-01-01T00:00:00Z'
			};
			mockApiClient.mockResolvedValue(mockResponse);

			const result = await updateProfile(updateData, token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith('/me/profile', {
				method: 'PUT',
				body: updateData,
				token,
				tenantId,
				fetch: mockFetch
			});
			expect(result).toEqual(mockResponse);
		});
	});

	describe('changePassword', () => {
		it('calls PUT /auth/password with body', async () => {
			const passwordData = {
				current_password: 'old-pass',
				new_password: 'new-pass',
				revoke_other_sessions: true
			};
			const mockResponse = { message: 'Password changed', sessions_revoked: 2 };
			mockApiClient.mockResolvedValue(mockResponse);

			const result = await changePassword(passwordData, token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith('/auth/password', {
				method: 'PUT',
				body: passwordData,
				token,
				tenantId,
				fetch: mockFetch
			});
			expect(result).toEqual(mockResponse);
		});
	});

	describe('getSecurityOverview', () => {
		it('calls GET /me/security', async () => {
			const mockResponse = {
				mfa_enabled: true,
				mfa_methods: ['totp'],
				trusted_devices_count: 2,
				active_sessions_count: 3,
				last_password_change: '2024-01-01T00:00:00Z',
				recent_security_alerts_count: 0,
				password_expires_at: null
			};
			mockApiClient.mockResolvedValue(mockResponse);

			const result = await getSecurityOverview(token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith('/me/security', {
				method: 'GET',
				token,
				tenantId,
				fetch: mockFetch
			});
			expect(result).toEqual(mockResponse);
		});
	});

	describe('initiateEmailChange', () => {
		it('calls POST /me/email/change with body', async () => {
			const emailData = { new_email: 'new@example.com', current_password: 'password123' };
			const mockResponse = { message: 'Verification email sent', expires_at: '2024-01-02T00:00:00Z' };
			mockApiClient.mockResolvedValue(mockResponse);

			const result = await initiateEmailChange(emailData, token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith('/me/email/change', {
				method: 'POST',
				body: emailData,
				token,
				tenantId,
				fetch: mockFetch
			});
			expect(result).toEqual(mockResponse);
		});
	});

	describe('verifyEmailChange', () => {
		it('calls POST /me/email/verify with body', async () => {
			const verifyData = { token: 'verification-token-123' };
			const mockResponse = { message: 'Email changed successfully', new_email: 'new@example.com' };
			mockApiClient.mockResolvedValue(mockResponse);

			const result = await verifyEmailChange(verifyData, token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith('/me/email/verify', {
				method: 'POST',
				body: verifyData,
				token,
				tenantId,
				fetch: mockFetch
			});
			expect(result).toEqual(mockResponse);
		});
	});
});
