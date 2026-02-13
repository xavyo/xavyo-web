import type {
	Connector,
	ConnectorListResponse,
	CreateConnectorRequest,
	UpdateConnectorRequest,
	ConnectorHealthStatus,
	ConnectorTestResult
} from './types';

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

export async function fetchConnectors(
	params: {
		name_contains?: string;
		connector_type?: string;
		status?: string;
		limit?: number;
		offset?: number;
	} = {},
	fetchFn: typeof fetch = fetch
): Promise<ConnectorListResponse> {
	const qs = buildSearchParams({
		name_contains: params.name_contains,
		connector_type: params.connector_type,
		status: params.status,
		limit: params.limit,
		offset: params.offset
	});
	const res = await fetchFn(`/api/connectors${qs}`);
	if (!res.ok) throw new Error(`Failed to fetch connectors: ${res.status}`);
	return res.json();
}

export async function createConnectorClient(
	data: CreateConnectorRequest,
	fetchFn: typeof fetch = fetch
): Promise<Connector> {
	const res = await fetchFn('/api/connectors', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(data)
	});
	if (!res.ok) throw new Error(`Failed to create connector: ${res.status}`);
	return res.json();
}

export async function getConnectorClient(
	id: string,
	fetchFn: typeof fetch = fetch
): Promise<Connector> {
	const res = await fetchFn(`/api/connectors/${id}`);
	if (!res.ok) throw new Error(`Failed to fetch connector: ${res.status}`);
	return res.json();
}

export async function updateConnectorClient(
	id: string,
	data: UpdateConnectorRequest,
	fetchFn: typeof fetch = fetch
): Promise<Connector> {
	const res = await fetchFn(`/api/connectors/${id}`, {
		method: 'PUT',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(data)
	});
	if (!res.ok) throw new Error(`Failed to update connector: ${res.status}`);
	return res.json();
}

export async function deleteConnectorClient(
	id: string,
	fetchFn: typeof fetch = fetch
): Promise<void> {
	const res = await fetchFn(`/api/connectors/${id}`, {
		method: 'DELETE'
	});
	if (!res.ok) throw new Error(`Failed to delete connector: ${res.status}`);
}

export async function testConnectionClient(
	id: string,
	fetchFn: typeof fetch = fetch
): Promise<ConnectorTestResult> {
	const res = await fetchFn(`/api/connectors/${id}/test`, {
		method: 'POST'
	});
	if (!res.ok) throw new Error(`Failed to test connection: ${res.status}`);
	return res.json();
}

export async function activateConnectorClient(
	id: string,
	fetchFn: typeof fetch = fetch
): Promise<Connector> {
	const res = await fetchFn(`/api/connectors/${id}/activate`, {
		method: 'POST'
	});
	if (!res.ok) throw new Error(`Failed to activate connector: ${res.status}`);
	return res.json();
}

export async function deactivateConnectorClient(
	id: string,
	fetchFn: typeof fetch = fetch
): Promise<Connector> {
	const res = await fetchFn(`/api/connectors/${id}/deactivate`, {
		method: 'POST'
	});
	if (!res.ok) throw new Error(`Failed to deactivate connector: ${res.status}`);
	return res.json();
}

export async function getConnectorHealthClient(
	id: string,
	fetchFn: typeof fetch = fetch
): Promise<ConnectorHealthStatus> {
	const res = await fetchFn(`/api/connectors/${id}/health`);
	if (!res.ok) throw new Error(`Failed to fetch connector health: ${res.status}`);
	return res.json();
}
