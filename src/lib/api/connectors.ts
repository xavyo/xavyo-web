import { apiClient } from './client';
import type {
	Connector,
	ConnectorListResponse,
	CreateConnectorRequest,
	UpdateConnectorRequest,
	ConnectorHealthStatus,
	ConnectorTestResult
} from './types';

export async function listConnectors(
	params: {
		name_contains?: string;
		connector_type?: string;
		status?: string;
		limit?: number;
		offset?: number;
	},
	token: string,
	tenantId: string,
	fetchFn?: typeof fetch
): Promise<ConnectorListResponse> {
	const searchParams = new URLSearchParams();
	if (params.name_contains) searchParams.set('name_contains', params.name_contains);
	if (params.connector_type) searchParams.set('connector_type', params.connector_type);
	if (params.status) searchParams.set('status', params.status);
	if (params.limit !== undefined) searchParams.set('limit', String(params.limit));
	if (params.offset !== undefined) searchParams.set('offset', String(params.offset));
	const qs = searchParams.toString();
	const endpoint = `/connectors${qs ? `?${qs}` : ''}`;

	return apiClient<ConnectorListResponse>(endpoint, {
		method: 'GET',
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function createConnector(
	body: CreateConnectorRequest,
	token: string,
	tenantId: string,
	fetchFn?: typeof fetch
): Promise<Connector> {
	return apiClient<Connector>('/connectors', {
		method: 'POST',
		body,
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function getConnector(
	id: string,
	token: string,
	tenantId: string,
	fetchFn?: typeof fetch
): Promise<Connector> {
	return apiClient<Connector>(`/connectors/${id}`, {
		method: 'GET',
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function updateConnector(
	id: string,
	body: UpdateConnectorRequest,
	token: string,
	tenantId: string,
	fetchFn?: typeof fetch
): Promise<Connector> {
	return apiClient<Connector>(`/connectors/${id}`, {
		method: 'PUT',
		body,
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function deleteConnector(
	id: string,
	token: string,
	tenantId: string,
	fetchFn?: typeof fetch
): Promise<void> {
	await apiClient<unknown>(`/connectors/${id}`, {
		method: 'DELETE',
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function testConnection(
	id: string,
	token: string,
	tenantId: string,
	fetchFn?: typeof fetch
): Promise<ConnectorTestResult> {
	return apiClient<ConnectorTestResult>(`/connectors/${id}/test`, {
		method: 'POST',
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function activateConnector(
	id: string,
	token: string,
	tenantId: string,
	fetchFn?: typeof fetch
): Promise<Connector> {
	return apiClient<Connector>(`/connectors/${id}/activate`, {
		method: 'POST',
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function deactivateConnector(
	id: string,
	token: string,
	tenantId: string,
	fetchFn?: typeof fetch
): Promise<Connector> {
	return apiClient<Connector>(`/connectors/${id}/deactivate`, {
		method: 'POST',
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function getConnectorHealth(
	id: string,
	token: string,
	tenantId: string,
	fetchFn?: typeof fetch
): Promise<ConnectorHealthStatus> {
	return apiClient<ConnectorHealthStatus>(`/connectors/${id}/health`, {
		method: 'GET',
		token,
		tenantId,
		fetch: fetchFn
	});
}
