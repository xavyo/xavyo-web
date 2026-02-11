import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
	getMfaStatus,
	setupTotp,
	verifyTotpSetup,
	disableTotp,
	regenerateRecoveryCodes,
	startWebauthnRegistration,
	finishWebauthnRegistration,
	listWebauthnCredentials,
	updateWebauthnCredential,
	deleteWebauthnCredential
} from './mfa';

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

describe('MFA API — TOTP', () => {
	const mockFetch = vi.fn();
	const token = 'test-token';
	const tenantId = 'test-tenant';

	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe('getMfaStatus', () => {
		it('calls GET /users/me/mfa/status', async () => {
			const mockResponse = {
				totp_enabled: true,
				webauthn_enabled: false,
				recovery_codes_remaining: 8,
				available_methods: ['totp', 'recovery'],
				setup_at: '2024-01-01T00:00:00Z',
				last_used_at: null
			};
			mockApiClient.mockResolvedValue(mockResponse);

			const result = await getMfaStatus(token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith('/users/me/mfa/status', {
				method: 'GET',
				token,
				tenantId,
				fetch: mockFetch
			});
			expect(result).toEqual(mockResponse);
		});
	});

	describe('setupTotp', () => {
		it('calls POST /auth/mfa/totp/setup without body', async () => {
			const mockResponse = {
				secret: 'JBSWY3DPEHPK3PXP',
				otpauth_uri: 'otpauth://totp/Xavyo:user@example.com?secret=JBSWY3DPEHPK3PXP',
				qr_code: 'data:image/png;base64,abc123'
			};
			mockApiClient.mockResolvedValue(mockResponse);

			const result = await setupTotp(token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith('/auth/mfa/totp/setup', {
				method: 'POST',
				token,
				tenantId,
				fetch: mockFetch
			});
			expect(result).toEqual(mockResponse);
		});
	});

	describe('verifyTotpSetup', () => {
		it('calls POST /auth/mfa/totp/verify-setup with body', async () => {
			const verifyData = { code: '123456' };
			const mockResponse = { recovery_codes: ['code1', 'code2', 'code3'], message: 'TOTP enabled' };
			mockApiClient.mockResolvedValue(mockResponse);

			const result = await verifyTotpSetup(verifyData, token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith('/auth/mfa/totp/verify-setup', {
				method: 'POST',
				body: verifyData,
				token,
				tenantId,
				fetch: mockFetch
			});
			expect(result).toEqual(mockResponse);
		});
	});

	describe('disableTotp', () => {
		it('calls DELETE /auth/mfa/totp with body', async () => {
			const disableData = { password: 'password123', code: '654321' };
			const mockResponse = { message: 'TOTP disabled' };
			mockApiClient.mockResolvedValue(mockResponse);

			const result = await disableTotp(disableData, token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith('/auth/mfa/totp', {
				method: 'DELETE',
				body: disableData,
				token,
				tenantId,
				fetch: mockFetch
			});
			expect(result).toEqual(mockResponse);
		});
	});

	describe('regenerateRecoveryCodes', () => {
		it('calls POST /auth/mfa/recovery/generate with body', async () => {
			const regenData = { password: 'password123' };
			const mockResponse = { recovery_codes: ['new1', 'new2', 'new3'], message: 'Codes regenerated' };
			mockApiClient.mockResolvedValue(mockResponse);

			const result = await regenerateRecoveryCodes(regenData, token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith('/auth/mfa/recovery/generate', {
				method: 'POST',
				body: regenData,
				token,
				tenantId,
				fetch: mockFetch
			});
			expect(result).toEqual(mockResponse);
		});
	});
});

describe('MFA API — WebAuthn', () => {
	const mockFetch = vi.fn();
	const token = 'test-token';
	const tenantId = 'test-tenant';

	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe('startWebauthnRegistration', () => {
		it('calls POST /auth/mfa/webauthn/register/start with body', async () => {
			const startData = { name: 'My Security Key' };
			const mockResponse = { publicKey: { challenge: 'abc123', rp: { name: 'Xavyo' } } };
			mockApiClient.mockResolvedValue(mockResponse);

			const result = await startWebauthnRegistration(startData, token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith('/auth/mfa/webauthn/register/start', {
				method: 'POST',
				body: startData,
				token,
				tenantId,
				fetch: mockFetch
			});
			expect(result).toEqual(mockResponse);
		});
	});

	describe('finishWebauthnRegistration', () => {
		it('calls POST /auth/mfa/webauthn/register/finish with body', async () => {
			const finishData = { id: 'cred-id', rawId: 'raw-id', response: { attestationObject: 'abc' } };
			const mockResponse = { credential: { id: 'wc-1', name: 'My Security Key', created_at: '2024-01-01T00:00:00Z' }, message: 'Registered' };
			mockApiClient.mockResolvedValue(mockResponse);

			const result = await finishWebauthnRegistration(finishData, token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith('/auth/mfa/webauthn/register/finish', {
				method: 'POST',
				body: finishData,
				token,
				tenantId,
				fetch: mockFetch
			});
			expect(result).toEqual(mockResponse);
		});
	});

	describe('listWebauthnCredentials', () => {
		it('calls GET /auth/mfa/webauthn/credentials', async () => {
			const mockResponse = { credentials: [{ id: 'wc-1', name: 'My Key', created_at: '2024-01-01T00:00:00Z' }], count: 1 };
			mockApiClient.mockResolvedValue(mockResponse);

			const result = await listWebauthnCredentials(token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith('/auth/mfa/webauthn/credentials', {
				method: 'GET',
				token,
				tenantId,
				fetch: mockFetch
			});
			expect(result).toEqual(mockResponse);
		});
	});

	describe('updateWebauthnCredential', () => {
		it('calls PATCH /auth/mfa/webauthn/credentials/:id with body', async () => {
			const updateData = { name: 'Renamed Key' };
			const mockResponse = { credential: { id: 'wc-1', name: 'Renamed Key', created_at: '2024-01-01T00:00:00Z' }, message: 'Updated' };
			mockApiClient.mockResolvedValue(mockResponse);

			const result = await updateWebauthnCredential('wc-1', updateData, token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith('/auth/mfa/webauthn/credentials/wc-1', {
				method: 'PATCH',
				body: updateData,
				token,
				tenantId,
				fetch: mockFetch
			});
			expect(result).toEqual(mockResponse);
		});
	});

	describe('deleteWebauthnCredential', () => {
		it('calls DELETE /auth/mfa/webauthn/credentials/:id', async () => {
			mockApiClient.mockResolvedValue(undefined);

			await deleteWebauthnCredential('wc-1', token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith('/auth/mfa/webauthn/credentials/wc-1', {
				method: 'DELETE',
				token,
				tenantId,
				fetch: mockFetch
			});
		});
	});
});
