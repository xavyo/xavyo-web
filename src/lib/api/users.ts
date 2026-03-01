import { apiClient } from './client';
import type {
	UserResponse,
	UserListResponse,
	CreateUserRequest,
	UpdateUserRequest
} from './types';

export interface ListUsersParams {
	offset?: number;
	limit?: number;
	email?: string;
}

export async function listUsers(
	params: ListUsersParams,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<UserListResponse> {
	const searchParams = new URLSearchParams();
	if (params.offset !== undefined) searchParams.set('offset', String(params.offset));
	if (params.limit !== undefined) searchParams.set('limit', String(params.limit));
	if (params.email) searchParams.set('email', params.email);

	const query = searchParams.toString();
	const endpoint = `/admin/users${query ? `?${query}` : ''}`;

	return apiClient<UserListResponse>(endpoint, {
		method: 'GET',
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function createUser(
	data: CreateUserRequest,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<UserResponse> {
	return apiClient<UserResponse>('/admin/users', {
		method: 'POST',
		body: data,
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function getUser(
	id: string,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<UserResponse> {
	return apiClient<UserResponse>(`/admin/users/${id}`, {
		method: 'GET',
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function updateUser(
	id: string,
	data: UpdateUserRequest,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<UserResponse> {
	return apiClient<UserResponse>(`/admin/users/${id}`, {
		method: 'PUT',
		body: data,
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function deleteUser(
	id: string,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<void> {
	await apiClient(`/admin/users/${id}`, {
		method: 'DELETE',
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function resetUserPassword(
	id: string,
	newPassword: string,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<{ user_id: string; message: string; sessions_revoked: number }> {
	return apiClient(`/admin/users/${id}/reset-password`, {
		method: 'POST',
		body: { new_password: newPassword },
		token,
		tenantId,
		fetch: fetchFn
	});
}
