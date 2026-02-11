import { apiClient } from './client';
import type {
	MfaStatus,
	TotpSetupResponse,
	TotpVerifySetupRequest,
	TotpVerifySetupResponse,
	TotpDisableRequest,
	MfaDisableResponse,
	RecoveryRegenerateRequest,
	RecoveryCodesResponse,
	StartRegistrationRequest,
	RegistrationResponse,
	WebAuthnCredentialList,
	UpdateCredentialRequest
} from './types';

export async function getMfaStatus(
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<MfaStatus> {
	return apiClient<MfaStatus>('/users/me/mfa/status', {
		method: 'GET',
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function setupTotp(
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<TotpSetupResponse> {
	return apiClient<TotpSetupResponse>('/auth/mfa/totp/setup', {
		method: 'POST',
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function verifyTotpSetup(
	data: TotpVerifySetupRequest,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<TotpVerifySetupResponse> {
	return apiClient<TotpVerifySetupResponse>('/auth/mfa/totp/verify-setup', {
		method: 'POST',
		body: data,
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function disableTotp(
	data: TotpDisableRequest,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<MfaDisableResponse> {
	return apiClient<MfaDisableResponse>('/auth/mfa/totp', {
		method: 'DELETE',
		body: data,
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function regenerateRecoveryCodes(
	data: RecoveryRegenerateRequest,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<RecoveryCodesResponse> {
	return apiClient<RecoveryCodesResponse>('/auth/mfa/recovery/generate', {
		method: 'POST',
		body: data,
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function startWebauthnRegistration(
	data: StartRegistrationRequest,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<unknown> {
	return apiClient<unknown>('/auth/mfa/webauthn/register/start', {
		method: 'POST',
		body: data,
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function finishWebauthnRegistration(
	data: unknown,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<RegistrationResponse> {
	return apiClient<RegistrationResponse>('/auth/mfa/webauthn/register/finish', {
		method: 'POST',
		body: data,
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function listWebauthnCredentials(
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<WebAuthnCredentialList> {
	return apiClient<WebAuthnCredentialList>('/auth/mfa/webauthn/credentials', {
		method: 'GET',
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function updateWebauthnCredential(
	id: string,
	data: UpdateCredentialRequest,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<RegistrationResponse> {
	return apiClient<RegistrationResponse>(`/auth/mfa/webauthn/credentials/${id}`, {
		method: 'PATCH',
		body: data,
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function deleteWebauthnCredential(
	id: string,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<void> {
	await apiClient(`/auth/mfa/webauthn/credentials/${id}`, {
		method: 'DELETE',
		token,
		tenantId,
		fetch: fetchFn
	});
}
