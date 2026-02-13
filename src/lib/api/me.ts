import { apiClient } from './client';
import type {
	UserProfile,
	UpdateProfileRequest,
	PasswordChangeRequest,
	PasswordChangeResponse,
	SecurityOverview,
	EmailChangeRequest,
	EmailChangeInitiatedResponse,
	EmailVerifyChangeRequest,
	EmailChangeCompletedResponse
} from './types';

export async function getProfile(
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<UserProfile> {
	return apiClient<UserProfile>('/me/profile', {
		method: 'GET',
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function updateProfile(
	data: UpdateProfileRequest,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<UserProfile> {
	return apiClient<UserProfile>('/me/profile', {
		method: 'PUT',
		body: data,
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function changePassword(
	data: PasswordChangeRequest,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<PasswordChangeResponse> {
	return apiClient<PasswordChangeResponse>('/auth/password', {
		method: 'PUT',
		body: data,
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function getSecurityOverview(
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<SecurityOverview> {
	return apiClient<SecurityOverview>('/me/security', {
		method: 'GET',
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function initiateEmailChange(
	data: EmailChangeRequest,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<EmailChangeInitiatedResponse> {
	return apiClient<EmailChangeInitiatedResponse>('/me/email/change', {
		method: 'POST',
		body: data,
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function verifyEmailChange(
	data: EmailVerifyChangeRequest,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<EmailChangeCompletedResponse> {
	return apiClient<EmailChangeCompletedResponse>('/me/email/verify', {
		method: 'POST',
		body: data,
		token,
		tenantId,
		fetch: fetchFn
	});
}
