import { apiClient } from './client';
import type {
	PoaGrant,
	PoaListResponse,
	GrantPoaRequest,
	RevokePoaRequest,
	ExtendPoaRequest,
	AssumeIdentityResponse,
	CurrentAssumptionStatus,
	PoaAuditListResponse
} from './types';

export interface ListPoaParams {
	direction: 'incoming' | 'outgoing';
	status?: string;
	limit?: number;
	offset?: number;
}

export interface AdminListPoaParams {
	donor_id?: string;
	attorney_id?: string;
	status?: string;
	limit?: number;
	offset?: number;
}

export interface ListPoaAuditParams {
	event_type?: string;
	from?: string;
	to?: string;
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

export async function grantPoa(
	data: GrantPoaRequest,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<PoaGrant> {
	return apiClient<PoaGrant>('/governance/power-of-attorney', {
		method: 'POST',
		body: data,
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function listPoa(
	params: ListPoaParams,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<PoaListResponse> {
	const qs = buildSearchParams({
		direction: params.direction,
		status: params.status,
		limit: params.limit,
		offset: params.offset
	});
	return apiClient<PoaListResponse>(`/governance/power-of-attorney${qs}`, {
		method: 'GET',
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function getPoa(
	id: string,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<PoaGrant> {
	return apiClient<PoaGrant>(`/governance/power-of-attorney/${id}`, {
		method: 'GET',
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function revokePoa(
	id: string,
	data: RevokePoaRequest,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<PoaGrant> {
	return apiClient<PoaGrant>(`/governance/power-of-attorney/${id}/revoke`, {
		method: 'POST',
		body: data,
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function extendPoa(
	id: string,
	data: ExtendPoaRequest,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<PoaGrant> {
	return apiClient<PoaGrant>(`/governance/power-of-attorney/${id}/extend`, {
		method: 'POST',
		body: data,
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function assumeIdentity(
	id: string,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<AssumeIdentityResponse> {
	return apiClient<AssumeIdentityResponse>(`/governance/power-of-attorney/${id}/assume`, {
		method: 'POST',
		body: {},
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function dropIdentity(
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<{ message: string }> {
	return apiClient<{ message: string }>('/governance/power-of-attorney/drop', {
		method: 'POST',
		body: {},
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function getCurrentAssumption(
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<CurrentAssumptionStatus> {
	return apiClient<CurrentAssumptionStatus>('/governance/power-of-attorney/current-assumption', {
		method: 'GET',
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function getPoaAudit(
	id: string,
	params: ListPoaAuditParams,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<PoaAuditListResponse> {
	const qs = buildSearchParams({
		event_type: params.event_type,
		from: params.from,
		to: params.to,
		limit: params.limit,
		offset: params.offset
	});
	return apiClient<PoaAuditListResponse>(`/governance/power-of-attorney/${id}/audit${qs}`, {
		method: 'GET',
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function adminListPoa(
	params: AdminListPoaParams,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<PoaListResponse> {
	const qs = buildSearchParams({
		donor_id: params.donor_id,
		attorney_id: params.attorney_id,
		status: params.status,
		limit: params.limit,
		offset: params.offset
	});
	return apiClient<PoaListResponse>(`/governance/admin/power-of-attorney${qs}`, {
		method: 'GET',
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function adminRevokePoa(
	id: string,
	data: RevokePoaRequest,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<PoaGrant> {
	return apiClient<PoaGrant>(`/governance/admin/power-of-attorney/${id}/revoke`, {
		method: 'POST',
		body: data,
		token,
		tenantId,
		fetch: fetchFn
	});
}
