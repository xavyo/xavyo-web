import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/api/mcp', () => ({
	callMcpTool: vi.fn()
}));

import { POST } from './+server';
import { callMcpTool } from '$lib/api/mcp';

const TOKEN = 'tok';
const TENANT = 'tid';

function makeEvent(body: string) {
	return {
		params: { name: 'search' },
		locals: { accessToken: TOKEN, tenantId: TENANT },
		fetch: vi.fn(),
		request: new Request('http://localhost/api/nhi/mcp/tools/search/call', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body
		})
	};
}

describe('POST /api/nhi/mcp/tools/:name/call', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('calls a tool with required fields', async () => {
		vi.mocked(callMcpTool).mockResolvedValue({ call_id: 'c1', result: {}, latency_ms: 1 } as any);
		const response = await POST(
			makeEvent(JSON.stringify({ nhi_id: 'n1', parameters: { query: 'x' } })) as any
		);
		expect(response.status).toBe(200);
		expect(callMcpTool).toHaveBeenCalled();
	});

	it('does not call on invalid JSON', async () => {
		await expect(POST(makeEvent('{not json') as any)).rejects.toMatchObject({ status: 400 });
		expect(callMcpTool).not.toHaveBeenCalled();
	});

	it('does not call when nhi_id is missing', async () => {
		await expect(
			POST(makeEvent(JSON.stringify({ parameters: { query: 'x' } })) as any)
		).rejects.toMatchObject({ status: 400 });
		expect(callMcpTool).not.toHaveBeenCalled();
	});
});
