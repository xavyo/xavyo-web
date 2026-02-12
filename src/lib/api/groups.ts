import { apiClient } from './client';
import type {
	UserGroupListResponse,
	UserGroup,
	GroupMembersResponse,
	CreateUserGroupRequest,
	UpdateUserGroupRequest,
	AddGroupMembersRequest
} from './types';

export interface ListGroupsParams {
	limit?: number;
	offset?: number;
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

export async function listGroups(
	params: ListGroupsParams,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<UserGroupListResponse> {
	const qs = buildSearchParams({
		limit: params.limit,
		offset: params.offset
	});
	return apiClient<UserGroupListResponse>(`/admin/groups${qs}`, {
		method: 'GET',
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function createGroup(
	body: CreateUserGroupRequest,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<UserGroup> {
	return apiClient<UserGroup>('/admin/groups', {
		method: 'POST',
		body,
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function getGroup(
	id: string,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<UserGroup> {
	return apiClient<UserGroup>(`/admin/groups/${id}`, {
		method: 'GET',
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function updateGroup(
	id: string,
	body: UpdateUserGroupRequest,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<UserGroup> {
	return apiClient<UserGroup>(`/admin/groups/${id}`, {
		method: 'PUT',
		body,
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function deleteGroup(
	id: string,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<void> {
	await apiClient(`/admin/groups/${id}`, {
		method: 'DELETE',
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function getGroupMembers(
	id: string,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<GroupMembersResponse> {
	return apiClient<GroupMembersResponse>(`/admin/groups/${id}/members`, {
		method: 'GET',
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function addGroupMembers(
	id: string,
	body: AddGroupMembersRequest,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<void> {
	await apiClient(`/admin/groups/${id}/members`, {
		method: 'POST',
		body,
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function removeGroupMember(
	groupId: string,
	userId: string,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<void> {
	await apiClient(`/admin/groups/${groupId}/members/${userId}`, {
		method: 'DELETE',
		token,
		tenantId,
		fetch: fetchFn
	});
}
