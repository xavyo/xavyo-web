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

export async function signup(
	data: SignupRequest,
	fetchFn?: typeof globalThis.fetch
): Promise<SignupResponse> {
	return apiClient<SignupResponse>('/auth/signup', {
		method: 'POST',
		body: data,
		fetch: fetchFn
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
	fetchFn?: typeof globalThis.fetch
): Promise<TokenResponse> {
	return apiClient<TokenResponse>('/auth/refresh', {
		method: 'POST',
		body: { refresh_token: refreshToken },
		fetch: fetchFn
	});
}

export async function logout(
	refreshToken: string,
	fetchFn?: typeof globalThis.fetch
): Promise<void> {
	await apiClient('/auth/logout', {
		method: 'POST',
		body: { refresh_token: refreshToken },
		fetch: fetchFn
	});
}

export async function forgotPassword(
	email: string,
	fetchFn?: typeof globalThis.fetch
): Promise<ForgotPasswordResponse> {
	return apiClient<ForgotPasswordResponse>('/auth/forgot-password', {
		method: 'POST',
		body: { email },
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
		fetch: fetchFn
	});
}
