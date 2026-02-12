import { apiClient } from './client';
import type {
	SignupRequest,
	SignupResponse,
	LoginRequest,
	TokenResponse,
	ForgotPasswordResponse,
	ResetPasswordResponse,
	VerifyEmailResponse
} from './types';

const SYSTEM_TENANT_ID = '00000000-0000-0000-0000-000000000001';

export async function signup(
	data: SignupRequest,
	fetchFn?: typeof globalThis.fetch
): Promise<SignupResponse> {
	return apiClient<SignupResponse>('/auth/signup', {
		method: 'POST',
		body: data,
		fetch: fetchFn,
		tenantId: SYSTEM_TENANT_ID
	});
}

export async function login(
	data: LoginRequest,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<TokenResponse> {
	return apiClient<TokenResponse>('/auth/login', {
		method: 'POST',
		body: data,
		fetch: fetchFn,
		tenantId
	});
}

export async function refresh(
	refreshToken: string,
	tenantId?: string,
	fetchFn?: typeof globalThis.fetch
): Promise<TokenResponse> {
	return apiClient<TokenResponse>('/auth/refresh', {
		method: 'POST',
		body: { refresh_token: refreshToken },
		tenantId: tenantId || SYSTEM_TENANT_ID,
		fetch: fetchFn
	});
}

export async function logout(
	refreshToken: string,
	tenantId?: string,
	fetchFn?: typeof globalThis.fetch
): Promise<void> {
	await apiClient('/auth/logout', {
		method: 'POST',
		body: { refresh_token: refreshToken },
		tenantId: tenantId || SYSTEM_TENANT_ID,
		fetch: fetchFn
	});
}

export async function forgotPassword(
	email: string,
	tenantId?: string,
	fetchFn?: typeof globalThis.fetch
): Promise<ForgotPasswordResponse> {
	return apiClient<ForgotPasswordResponse>('/auth/forgot-password', {
		method: 'POST',
		body: { email },
		tenantId: tenantId || SYSTEM_TENANT_ID,
		fetch: fetchFn
	});
}

export async function resetPassword(
	token: string,
	newPassword: string,
	fetchFn?: typeof globalThis.fetch
): Promise<ResetPasswordResponse> {
	return apiClient<ResetPasswordResponse>('/auth/reset-password', {
		method: 'POST',
		body: { token, new_password: newPassword },
		tenantId: SYSTEM_TENANT_ID,
		fetch: fetchFn
	});
}

export async function verifyEmail(
	token: string,
	fetchFn?: typeof globalThis.fetch
): Promise<VerifyEmailResponse> {
	return apiClient<VerifyEmailResponse>('/auth/verify-email', {
		method: 'POST',
		body: { token },
		tenantId: SYSTEM_TENANT_ID,
		fetch: fetchFn
	});
}
