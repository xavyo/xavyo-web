import { apiClient } from './client';
import type { GatewayInfo, DiscoverToolsResponse, ImportToolsResponse, DiscoveredTool, SyncCheckResult } from './types';

export async function listGateways(
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<GatewayInfo[]> {
	return apiClient<GatewayInfo[]>('/nhi/mcp-discovery/gateways', {
		method: 'GET',
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function discoverTools(
	gatewayName: string | undefined,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<DiscoverToolsResponse> {
	const params = gatewayName ? `?gateway_name=${encodeURIComponent(gatewayName)}` : '';
	return apiClient<DiscoverToolsResponse>(`/nhi/mcp-discovery/tools${params}`, {
		method: 'GET',
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function importTools(
	tools: DiscoveredTool[],
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<ImportToolsResponse> {
	return apiClient<ImportToolsResponse>('/nhi/mcp-discovery/import', {
		method: 'POST',
		body: { tools },
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function syncCheck(
	gatewayName: string | undefined,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<SyncCheckResult> {
	const params = gatewayName ? `?gateway_name=${encodeURIComponent(gatewayName)}` : '';
	return apiClient<SyncCheckResult>(`/nhi/mcp-discovery/sync-check${params}`, {
		method: 'GET',
		token,
		tenantId,
		fetch: fetchFn
	});
}
