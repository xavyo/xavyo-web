import type { Invitation, InvitationListResponse, CreateInvitationRequest } from './types';

function buildSearchParams(params: Record<string, string | number | undefined>): string {
	const searchParams = new URLSearchParams();
	for (const [key, value] of Object.entries(params)) {
		if (value !== undefined) {
			searchParams.set(key, String(value));
		}
	}
	const qs = searchParams.toString();
	return qs ? `?${qs}` : '';
}

export async function fetchInvitations(
	params: { status?: string; email?: string; limit?: number; offset?: number } = {},
	fetchFn: typeof fetch = fetch
): Promise<InvitationListResponse> {
	const qs = buildSearchParams({
		status: params.status,
		email: params.email,
		limit: params.limit,
		offset: params.offset
	});
	const res = await fetchFn(`/api/invitations${qs}`);
	if (!res.ok) throw new Error(`Failed to fetch invitations: ${res.status}`);
	return res.json();
}

export async function createInvitationClient(
	data: CreateInvitationRequest,
	fetchFn: typeof fetch = fetch
): Promise<Invitation> {
	const res = await fetchFn('/api/invitations', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(data)
	});
	if (!res.ok) throw new Error(`Failed to create invitation: ${res.status}`);
	return res.json();
}

export async function resendInvitationClient(
	id: string,
	fetchFn: typeof fetch = fetch
): Promise<void> {
	const res = await fetchFn(`/api/invitations/${id}/resend`, {
		method: 'POST'
	});
	if (!res.ok) throw new Error(`Failed to resend invitation: ${res.status}`);
}

export async function cancelInvitationClient(
	id: string,
	fetchFn: typeof fetch = fetch
): Promise<Invitation> {
	const res = await fetchFn(`/api/invitations/${id}`, {
		method: 'DELETE'
	});
	if (!res.ok) throw new Error(`Failed to cancel invitation: ${res.status}`);
	return res.json();
}
