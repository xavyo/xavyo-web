import { describe, it, expect, vi, beforeEach } from 'vitest';
import { listMcpTools, callMcpTool } from './mcp';

vi.mock('./client', () => ({
	apiClient: vi.fn(),
	ApiError: class ApiError extends Error {
		status: number;
		constructor(message: string, status: number) {
			super(message);
			this.status = status;
		}
	}
}));

import { apiClient } from './client';

const mockApiClient = vi.mocked(apiClient);

describe('MCP API', () => {
	const mockFetch = vi.fn();
	const token = 'test-token';
	const tenantId = 'test-tenant';

	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe('listMcpTools', () => {
		it('calls GET /mcp/tools with nhi_id param', async () => {
			const mockResponse = { tools: [] };
			mockApiClient.mockResolvedValue(mockResponse);

			const result = await listMcpTools({ nhi_id: 'nhi-123' }, token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith('/mcp/tools?nhi_id=nhi-123', {
				method: 'GET',
				token,
				tenantId,
				fetch: mockFetch
			});
			expect(result).toEqual(mockResponse);
		});

		it('returns tools list from response', async () => {
			const tools = [
				{ name: 'search', description: 'Search tool', input_schema: {}, status: 'active', deprecated: false }
			];
			mockApiClient.mockResolvedValue({ tools });

			const result = await listMcpTools({ nhi_id: 'nhi-456' }, token, tenantId, mockFetch);

			expect(result.tools).toHaveLength(1);
			expect(result.tools[0].name).toBe('search');
		});
	});

	describe('callMcpTool', () => {
		it('calls POST /mcp/tools/:name/call with body', async () => {
			const mockResponse = { call_id: 'call-1', result: { output: 'done' }, latency_ms: 42 };
			mockApiClient.mockResolvedValue(mockResponse);

			const body = { nhi_id: 'nhi-123', parameters: { query: 'test' } };
			const result = await callMcpTool('search', body, token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith('/mcp/tools/search/call', {
				method: 'POST',
				token,
				tenantId,
				body: JSON.stringify(body),
				fetch: mockFetch
			});
			expect(result).toEqual(mockResponse);
		});

		it('encodes tool name in URL', async () => {
			mockApiClient.mockResolvedValue({ call_id: 'call-2', result: {}, latency_ms: 10 });

			const body = { nhi_id: 'nhi-123', parameters: {} };
			await callMcpTool('my tool/v2', body, token, tenantId, mockFetch);

			const calledPath = (mockApiClient.mock.calls[0] as unknown[])[0] as string;
			expect(calledPath).toBe('/mcp/tools/my%20tool%2Fv2/call');
		});

		it('passes context in body when provided', async () => {
			mockApiClient.mockResolvedValue({ call_id: 'call-3', result: {}, latency_ms: 5 });

			const body = {
				nhi_id: 'nhi-789',
				parameters: { key: 'value' },
				context: { conversation_id: 'conv-1', session_id: 'sess-1' }
			};
			await callMcpTool('analyze', body, token, tenantId, mockFetch);

			const calledOptions = (mockApiClient.mock.calls[0] as unknown[])[1] as Record<string, unknown>;
			expect(calledOptions.body).toBe(JSON.stringify(body));
		});

		it('returns call_id and result from response', async () => {
			const mockResponse = { call_id: 'call-4', result: { answer: 42 }, latency_ms: 100 };
			mockApiClient.mockResolvedValue(mockResponse);

			const result = await callMcpTool(
				'compute',
				{ nhi_id: 'nhi-1', parameters: { x: 1 } },
				token,
				tenantId,
				mockFetch
			);

			expect(result.call_id).toBe('call-4');
			expect(result.result).toEqual({ answer: 42 });
			expect(result.latency_ms).toBe(100);
		});
	});
});
