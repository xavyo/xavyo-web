import { apiClient } from './client';
import type { SessionList, RevokeAllSessionsResponse } from './types';

export async function listSessions(
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<SessionList> {
	return apiClient<SessionList>('/users/me/sessions', {
		method: 'GET',
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function revokeSession(
	id: string,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<void> {
	await apiClient(`/users/me/sessions/${id}`, {
		method: 'DELETE',
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function revokeAllOtherSessions(
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<RevokeAllSessionsResponse> {
	return apiClient<RevokeAllSessionsResponse>('/users/me/sessions', {
		method: 'DELETE',
		token,
		tenantId,
		fetch: fetchFn
	});
}
