import { apiClient } from './client';
import type { Invitation, InvitationListResponse, CreateInvitationRequest } from './types';

export async function listInvitations(
	params: { status?: string; email?: string; limit?: number; offset?: number },
	token: string,
	tenantId: string,
	fetchFn?: typeof fetch
): Promise<InvitationListResponse> {
	const searchParams = new URLSearchParams();
	if (params.status) searchParams.set('status', params.status);
	if (params.email) searchParams.set('email', params.email);
	if (params.limit !== undefined) searchParams.set('limit', String(params.limit));
	if (params.offset !== undefined) searchParams.set('offset', String(params.offset));
	const qs = searchParams.toString();
	const endpoint = `/admin/invitations${qs ? `?${qs}` : ''}`;

	return apiClient<InvitationListResponse>(endpoint, {
		method: 'GET',
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function createInvitation(
	body: CreateInvitationRequest,
	token: string,
	tenantId: string,
	fetchFn?: typeof fetch
): Promise<Invitation> {
	return apiClient<Invitation>('/admin/invitations', {
		method: 'POST',
		body,
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function resendInvitation(
	id: string,
	token: string,
	tenantId: string,
	fetchFn?: typeof fetch
): Promise<void> {
	await apiClient<unknown>(`/admin/invitations/${id}/resend`, {
		method: 'POST',
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function cancelInvitation(
	id: string,
	token: string,
	tenantId: string,
	fetchFn?: typeof fetch
): Promise<Invitation> {
	return apiClient<Invitation>(`/admin/invitations/${id}`, {
		method: 'DELETE',
		token,
		tenantId,
		fetch: fetchFn
	});
}
