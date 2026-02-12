import { apiClient } from './client';
import type {
	PeerGroup,
	CreatePeerGroupRequest,
	PeerGroupRefreshResult,
	RefreshAllPeerGroupsResult,
	UserPeerComparison
} from './types';

interface PaginatedResponse<T> {
	items: T[];
	total: number;
	limit: number;
	offset: number;
}

function buildSearchParams(params: Record<string, string | number | boolean | undefined>): string {
	const searchParams = new URLSearchParams();
	for (const [key, value] of Object.entries(params)) {
		if (value !== undefined) {
			searchParams.set(key, String(value));
		}
	}
	const qs = searchParams.toString();
	return qs ? `?${qs}` : '';
}

export interface ListPeerGroupsParams {
	group_type?: string;
	attribute_key?: string;
	min_user_count?: number;
	limit?: number;
	offset?: number;
}

export async function listPeerGroups(
	params: ListPeerGroupsParams,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<PaginatedResponse<PeerGroup>> {
	const qs = buildSearchParams(params as Record<string, string | number | boolean | undefined>);
	return apiClient<PaginatedResponse<PeerGroup>>(`/governance/peer-groups${qs}`, {
		method: 'GET',
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function createPeerGroup(
	body: CreatePeerGroupRequest,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<PeerGroup> {
	return apiClient<PeerGroup>('/governance/peer-groups', {
		method: 'POST',
		token,
		tenantId,
		body,
		fetch: fetchFn
	});
}

export async function getPeerGroup(
	id: string,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<PeerGroup> {
	return apiClient<PeerGroup>(`/governance/peer-groups/${id}`, {
		method: 'GET',
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function deletePeerGroup(
	id: string,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<void> {
	return apiClient<void>(`/governance/peer-groups/${id}`, {
		method: 'DELETE',
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function refreshPeerGroup(
	id: string,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<PeerGroupRefreshResult> {
	return apiClient<PeerGroupRefreshResult>(`/governance/peer-groups/${id}/refresh`, {
		method: 'POST',
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function refreshAllPeerGroups(
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<RefreshAllPeerGroupsResult> {
	return apiClient<RefreshAllPeerGroupsResult>('/governance/peer-groups/refresh-all', {
		method: 'POST',
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function getUserPeerComparison(
	userId: string,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<UserPeerComparison> {
	return apiClient<UserPeerComparison>(`/governance/users/${userId}/peer-comparison`, {
		method: 'GET',
		token,
		tenantId,
		fetch: fetchFn
	});
}
