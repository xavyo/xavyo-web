import { apiClient } from './client';
import type { McpToolsResponse, McpCallRequest, McpCallResponse } from './types';

export interface ListMcpToolsParams {
	nhi_id: string;
}

export async function listMcpTools(
	params: ListMcpToolsParams,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<McpToolsResponse> {
	return apiClient<McpToolsResponse>(`/mcp/tools?nhi_id=${params.nhi_id}`, {
		method: 'GET',
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function callMcpTool(
	toolName: string,
	body: McpCallRequest & { nhi_id: string },
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<McpCallResponse> {
	return apiClient<McpCallResponse>(`/mcp/tools/${encodeURIComponent(toolName)}/call`, {
		method: 'POST',
		token,
		tenantId,
		body: JSON.stringify(body),
		fetch: fetchFn
	});
}
