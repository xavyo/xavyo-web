import { vi, describe, it, expect, beforeEach } from 'vitest';

function mockResponse(data: unknown, ok = true, status = 200) {
	return {
		ok,
		status,
		json: () => Promise.resolve(data)
	};
}

describe('mcp-client', () => {
	const mockFetch = vi.fn();

	beforeEach(() => {
		mockFetch.mockReset();
		vi.resetModules();
	});

	describe('fetchMcpTools', () => {
		it('fetches from /api/nhi/mcp/tools with nhi_id param', async () => {
			const data = { tools: [{ name: 'search', description: 'Search', input_schema: {}, status: 'active', deprecated: false }] };
			mockFetch.mockResolvedValueOnce(mockResponse(data));
			const { fetchMcpTools } = await import('./mcp-client');

			const result = await fetchMcpTools('nhi-123', mockFetch);

			expect(mockFetch).toHaveBeenCalledWith('/api/nhi/mcp/tools?nhi_id=nhi-123');
			expect(result).toEqual(data);
		});

		it('throws on non-ok response', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null, false, 500));
			const { fetchMcpTools } = await import('./mcp-client');

			await expect(fetchMcpTools('nhi-bad', mockFetch)).rejects.toThrow(
				'Failed to fetch MCP tools: 500'
			);
		});
	});

	describe('invokeMcpTool', () => {
		it('sends POST to /api/nhi/mcp/tools/:name/call with body', async () => {
			const data = { call_id: 'call-1', result: { output: 'done' }, latency_ms: 42 };
			mockFetch.mockResolvedValueOnce(mockResponse(data));
			const { invokeMcpTool } = await import('./mcp-client');

			const result = await invokeMcpTool('search', 'nhi-123', { query: 'test' }, mockFetch);

			expect(mockFetch).toHaveBeenCalledWith('/api/nhi/mcp/tools/search/call', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ nhi_id: 'nhi-123', parameters: { query: 'test' } })
			});
			expect(result).toEqual(data);
		});

		it('throws parsed error on non-ok response', async () => {
			const errorBody = { message: 'Rate limit exceeded', error_code: 'RateLimitExceeded' };
			mockFetch.mockResolvedValueOnce({
				ok: false,
				status: 429,
				json: () => Promise.resolve(errorBody)
			});
			const { invokeMcpTool } = await import('./mcp-client');

			await expect(invokeMcpTool('search', 'nhi-123', {}, mockFetch)).rejects.toEqual(errorBody);
		});
	});
});
