import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/api/nhi-permissions', () => ({
	grantToolPermission: vi.fn()
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
import { grantToolPermission } from '$lib/api/nhi-permissions';

const TOKEN = 'tok';
const TENANT = 'tid';

function makeEvent(body: string) {
	return {
		params: { agentId: 'a1', toolId: 't1' },
		locals: { accessToken: TOKEN, tenantId: TENANT },
		fetch: vi.fn(),
		request: new Request('http://localhost/api/nhi/permissions/agents/a1/tools/t1/grant', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body
		})
	};
}

describe('POST /api/nhi/permissions/agents/:agentId/tools/:toolId/grant', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('grants with optional expires_at', async () => {
		vi.mocked(grantToolPermission).mockResolvedValue({ id: 'p1' } as any);
		const response = await POST(makeEvent(JSON.stringify({ expires_at: '2026-01-01' })) as any);
		expect(response.status).toBe(201);
		expect(grantToolPermission).toHaveBeenCalled();
	});

	it('does not grant on invalid JSON', async () => {
		await expect(POST(makeEvent('{not json') as any)).rejects.toMatchObject({ status: 400 });
		expect(grantToolPermission).not.toHaveBeenCalled();
	});

	it('does not grant when expires_at is not a string', async () => {
		await expect(POST(makeEvent(JSON.stringify({ expires_at: 12 })) as any)).rejects.toMatchObject({
			status: 400
		});
		expect(grantToolPermission).not.toHaveBeenCalled();
	});
});
