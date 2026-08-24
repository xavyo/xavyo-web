import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/server/auth', () => ({
	hasAdminRole: vi.fn().mockReturnValue(true)
}));

vi.mock('$lib/api/nhi-permissions', () => ({
	bulkGrantToolPermissions: vi.fn()
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
import { bulkGrantToolPermissions } from '$lib/api/nhi-permissions';
import { hasAdminRole } from '$lib/server/auth';

const TOKEN = 'tok';
const TENANT = 'tid';

function makeEvent(body: string) {
	return {
		locals: { accessToken: TOKEN, tenantId: TENANT, user: { roles: ['admin'] } },
		params: { agentId: 'agent-1' },
		fetch: vi.fn(),
		request: new Request('http://localhost/api/nhi/permissions/agents/agent-1/tools/bulk-grant', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body
		})
	};
}

describe('POST /api/nhi/permissions/agents/:agentId/tools/bulk-grant', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.mocked(hasAdminRole).mockReturnValue(true);
	});

	it('grants the requested tool_ids', async () => {
		vi.mocked(bulkGrantToolPermissions).mockResolvedValue({ granted: [] } as any);
		const response = await POST(makeEvent(JSON.stringify({ tool_ids: ['t1'] })) as any);
		expect(response.status).toBe(200);
		expect(bulkGrantToolPermissions).toHaveBeenCalledWith(
			'agent-1',
			{ tool_ids: ['t1'], permission_type: undefined, expires_at: undefined },
			TOKEN,
			TENANT,
			expect.any(Function)
		);
	});

	it('does not grant on invalid JSON', async () => {
		await expect(POST(makeEvent('{not json') as any)).rejects.toMatchObject({ status: 400 });
		expect(bulkGrantToolPermissions).not.toHaveBeenCalled();
	});

	it('does not grant when tool_ids is missing', async () => {
		await expect(POST(makeEvent(JSON.stringify({})) as any)).rejects.toMatchObject({
			status: 400
		});
		expect(bulkGrantToolPermissions).not.toHaveBeenCalled();
	});
});
