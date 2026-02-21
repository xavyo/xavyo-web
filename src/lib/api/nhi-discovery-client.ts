import type { GatewayInfo, DiscoverToolsResponse, DiscoveredTool, ImportToolsResponse, SyncCheckResult } from './types';

async function parseJsonResponse<T>(res: Response): Promise<T> {
	const text = await res.text();
	return JSON.parse(text) as T;
}

function handleAuthError(res: Response): never {
	if (res.status === 401) {
		// Session expired — redirect to login
		window.location.href = '/login';
	}
	throw new Error('Unexpected auth error');
}

export async function fetchGateways(fetchFn: typeof fetch = fetch): Promise<GatewayInfo[]> {
	const res = await fetchFn('/api/nhi/mcp-discovery/gateways');
	if (!res.ok) {
		if (res.status === 401) handleAuthError(res);
		throw new Error(`Failed to fetch gateways: ${res.status}`);
	}
	return parseJsonResponse<GatewayInfo[]>(res);
}

export async function fetchDiscoveredTools(
	gatewayName?: string,
	fetchFn: typeof fetch = fetch
): Promise<DiscoverToolsResponse> {
	const params = gatewayName ? `?gateway_name=${encodeURIComponent(gatewayName)}` : '';
	const res = await fetchFn(`/api/nhi/mcp-discovery/tools${params}`);
	if (!res.ok) {
		if (res.status === 401) handleAuthError(res);
		let message = `Failed to discover tools: ${res.status}`;
		try {
			const body = await parseJsonResponse<{ message?: string }>(res);
			if (body.message) message = body.message;
		} catch {
			// ignore parse error
		}
		throw new Error(message);
	}
	return parseJsonResponse<DiscoverToolsResponse>(res);
}

export async function importSelectedTools(
	tools: DiscoveredTool[],
	fetchFn: typeof fetch = fetch
): Promise<ImportToolsResponse> {
	const res = await fetchFn('/api/nhi/mcp-discovery/import', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ tools })
	});
	if (!res.ok) {
		if (res.status === 401) handleAuthError(res);
		let message = `Failed to import tools: ${res.status}`;
		try {
			const body = await parseJsonResponse<{ message?: string }>(res);
			if (body.message) message = body.message;
		} catch {
			// ignore parse error
		}
		throw new Error(message);
	}
	return parseJsonResponse<ImportToolsResponse>(res);
}

export async function fetchSyncCheck(
	gatewayName?: string,
	fetchFn: typeof fetch = fetch
): Promise<SyncCheckResult> {
	const params = gatewayName ? `?gateway_name=${encodeURIComponent(gatewayName)}` : '';
	const res = await fetchFn(`/api/nhi/mcp-discovery/sync-check${params}`);
	if (!res.ok) {
		if (res.status === 401) handleAuthError(res);
		throw new Error(`Failed to check sync: ${res.status}`);
	}
	return parseJsonResponse<SyncCheckResult>(res);
}
