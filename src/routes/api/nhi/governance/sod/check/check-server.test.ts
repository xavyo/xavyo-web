import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/server/auth', () => ({
	hasAdminRole: vi.fn().mockReturnValue(true)
}));

vi.mock('$lib/api/nhi-governance', () => ({
	checkNhiSod: vi.fn()
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
import { checkNhiSod } from '$lib/api/nhi-governance';
import { hasAdminRole } from '$lib/server/auth';

const TOKEN = 'tok';
const TENANT = 'tid';

function makeEvent(body: string) {
	return {
		locals: { accessToken: TOKEN, tenantId: TENANT, user: { roles: ['admin'] } },
		fetch: vi.fn(),
		request: new Request('http://localhost/api/nhi/governance/sod/check', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body
		})
	};
}

describe('POST /api/nhi/governance/sod/check', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.mocked(hasAdminRole).mockReturnValue(true);
	});

	it('checks SoD with required fields', async () => {
		vi.mocked(checkNhiSod).mockResolvedValue({ is_allowed: true, violations: [] } as any);
		const response = await POST(makeEvent(JSON.stringify({ agent_id: 'a1', tool_id: 't1' })) as any);
		expect(response.status).toBe(200);
		expect(checkNhiSod).toHaveBeenCalled();
	});

	it('does not check on invalid JSON', async () => {
		await expect(POST(makeEvent('{not json') as any)).rejects.toMatchObject({ status: 400 });
		expect(checkNhiSod).not.toHaveBeenCalled();
	});

	it('does not check when agent_id is missing', async () => {
		await expect(POST(makeEvent(JSON.stringify({ tool_id: 't1' })) as any)).rejects.toMatchObject({
			status: 400
		});
		expect(checkNhiSod).not.toHaveBeenCalled();
	});
});
