import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$env/dynamic/private', () => ({
	env: { API_BASE_URL: 'http://localhost:8080' }
}));

import { callMcpTool } from './mcp';

describe('callMcpTool body encoding', () => {
	let mockFetch: ReturnType<typeof vi.fn>;

	beforeEach(() => {
		mockFetch = vi.fn().mockResolvedValue({
			ok: true,
			status: 200,
			text: () => Promise.resolve(JSON.stringify({ call_id: 'c1', result: {}, latency_ms: 1 }))
		});
	});

	it('sends a JSON object (not a double-stringified string) on the wire', async () => {
		const payload = { nhi_id: 'nhi-123', parameters: { query: 'test' } };
		await callMcpTool('search', payload, 'tok', 'tenant-1', mockFetch as unknown as typeof fetch);

		expect(mockFetch).toHaveBeenCalledTimes(1);
		const init = mockFetch.mock.calls[0][1] as RequestInit;
		expect(typeof init.body).toBe('string');
		const parsed = JSON.parse(init.body as string);
		expect(parsed).toEqual(payload);
		expect(typeof parsed).toBe('object');
	});
});
