import type { McpToolsResponse, McpCallResponse } from './types';

export async function fetchMcpTools(
	nhiId: string,
	fetchFn: typeof fetch = fetch
): Promise<McpToolsResponse> {
	const res = await fetchFn(`/api/nhi/mcp/tools?nhi_id=${nhiId}`);
	if (!res.ok) throw new Error(`Failed to fetch MCP tools: ${res.status}`);
	return res.json();
}

export async function invokeMcpTool(
	toolName: string,
	nhiId: string,
	parameters: Record<string, unknown>,
	fetchFn: typeof fetch = fetch
): Promise<McpCallResponse> {
	const res = await fetchFn(`/api/nhi/mcp/tools/${encodeURIComponent(toolName)}/call`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ nhi_id: nhiId, parameters })
	});
	if (!res.ok) {
		const error = await res.json().catch(() => ({ message: `HTTP ${res.status}` }));
		throw error;
	}
	return res.json();
}
