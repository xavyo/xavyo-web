import { describe, it, expect, vi, beforeEach } from 'vitest';
import { signup, login, refresh, logout, forgotPassword, resetPassword, verifyEmail } from './auth';

// Mock the client module
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

describe('auth API functions', () => {
	const mockFetch = vi.fn();

	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe('signup', () => {
		it('calls POST /auth/signup with correct body', async () => {
			const signupData = { email: 'test@example.com', password: 'password123', display_name: 'Test' };
			const mockResponse = { user_id: '123', email: 'test@example.com', email_verified: false, access_token: 'tok', token_type: 'Bearer', expires_in: 3600 };
			mockApiClient.mockResolvedValue(mockResponse);

			const result = await signup(signupData, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith('/auth/signup', {
				method: 'POST',
				body: signupData,
				fetch: mockFetch
			});
			expect(result).toEqual(mockResponse);
		});
	});

	describe('login', () => {
		it('calls POST /auth/login with X-Tenant-Id', async () => {
			const loginData = { email: 'test@example.com', password: 'password123' };
			const mockResponse = { access_token: 'at', refresh_token: 'rt', token_type: 'Bearer', expires_in: 3600 };
			mockApiClient.mockResolvedValue(mockResponse);

			const result = await login(loginData, 'tenant-abc', mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith('/auth/login', {
				method: 'POST',
				body: loginData,
				fetch: mockFetch,
				tenantId: 'tenant-abc'
			});
			expect(result).toEqual(mockResponse);
		});
	});

	describe('refresh', () => {
		it('calls POST /auth/refresh with refresh_token', async () => {
			const mockResponse = { access_token: 'new-at', refresh_token: 'new-rt', token_type: 'Bearer', expires_in: 3600 };
			mockApiClient.mockResolvedValue(mockResponse);

			const result = await refresh('old-rt', mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith('/auth/refresh', {
				method: 'POST',
				body: { refresh_token: 'old-rt' },
				fetch: mockFetch
			});
			expect(result).toEqual(mockResponse);
		});
	});

	describe('logout', () => {
		it('calls POST /auth/logout with refresh_token', async () => {
			mockApiClient.mockResolvedValue(null);

			await logout('my-rt', mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith('/auth/logout', {
				method: 'POST',
				body: { refresh_token: 'my-rt' },
				fetch: mockFetch
			});
		});
	});

	describe('forgotPassword', () => {
		it('calls POST /auth/forgot-password with email', async () => {
			const mockResponse = { message: 'Reset link sent' };
			mockApiClient.mockResolvedValue(mockResponse);

			const result = await forgotPassword('test@example.com', mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith('/auth/forgot-password', {
				method: 'POST',
				body: { email: 'test@example.com' },
				fetch: mockFetch
			});
			expect(result).toEqual(mockResponse);
		});
	});

	describe('resetPassword', () => {
		it('calls POST /auth/reset-password with token and new_password', async () => {
			const mockResponse = { message: 'Password reset' };
			mockApiClient.mockResolvedValue(mockResponse);

			const result = await resetPassword('tok123', 'newpass123', mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith('/auth/reset-password', {
				method: 'POST',
				body: { token: 'tok123', new_password: 'newpass123' },
				fetch: mockFetch
			});
			expect(result).toEqual(mockResponse);
		});
	});

	describe('verifyEmail', () => {
		it('calls POST /auth/verify-email with token', async () => {
			const mockResponse = { message: 'Email verified', already_verified: false };
			mockApiClient.mockResolvedValue(mockResponse);

			const result = await verifyEmail('tok456', mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith('/auth/verify-email', {
				method: 'POST',
				body: { token: 'tok456' },
				fetch: mockFetch
			});
			expect(result).toEqual(mockResponse);
		});
	});
});
