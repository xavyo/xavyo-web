import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/server/auth', () => ({
	hasAdminRole: vi.fn().mockReturnValue(true)
}));

vi.mock('$lib/api/nhi-discovery', () => ({
	importTools: vi.fn()
}));

vi.mock('$lib/api/client', () => ({
	ApiError: class ApiError extends Error {
		status: number;
		constructor(message: string, status: number) {
			super(message);
			this.status = status;
		}
	}
}));

import { POST } from './+server';
import { importTools } from '$lib/api/nhi-discovery';
import { hasAdminRole } from '$lib/server/auth';

const TOKEN = 'tok';
const TENANT = 'tid';

function makeEvent(body: string) {
	return {
		locals: { accessToken: TOKEN, tenantId: TENANT, user: { roles: ['admin'] } },
		fetch: vi.fn(),
		request: new Request('http://localhost/api/nhi/mcp-discovery/import', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body
		})
	};
}

describe('POST /api/nhi/mcp-discovery/import', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.mocked(hasAdminRole).mockReturnValue(true);
	});

	it('imports the requested tools', async () => {
		vi.mocked(importTools).mockResolvedValue({ imported: 1 } as any);
		const tools = [{ name: 'search' }];
		const response = await POST(makeEvent(JSON.stringify({ tools })) as any);
		expect(response.status).toBe(201);
		expect(importTools).toHaveBeenCalledWith(tools, TOKEN, TENANT, expect.any(Function));
	});

	it('does not import on invalid JSON', async () => {
		await expect(POST(makeEvent('{not json') as any)).rejects.toMatchObject({ status: 400 });
		expect(importTools).not.toHaveBeenCalled();
	});

	it('does not import when tools is missing', async () => {
		await expect(POST(makeEvent(JSON.stringify({})) as any)).rejects.toMatchObject({
			status: 400
		});
		expect(importTools).not.toHaveBeenCalled();
	});

	it('does not 403 a non-admin JWT user', async () => {
		vi.mocked(hasAdminRole).mockReturnValue(false);
		vi.mocked(importTools).mockResolvedValue({ imported: 1 } as any);
		const response = await POST(makeEvent(JSON.stringify({ tools: [{ name: 'search' }] })) as any);
		expect(response.status).toBe(201);
		expect(importTools).toHaveBeenCalled();
	});
});
