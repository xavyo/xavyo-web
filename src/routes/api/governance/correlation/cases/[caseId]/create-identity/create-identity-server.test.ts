import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/server/auth', () => ({
	hasAdminRole: vi.fn().mockReturnValue(true)
}));

vi.mock('$lib/api/correlation', () => ({
	createIdentityFromCase: vi.fn()
}));

import { POST } from './+server';
import { createIdentityFromCase } from '$lib/api/correlation';
import { hasAdminRole } from '$lib/server/auth';

const TOKEN = 'tok';
const TENANT = 'tid';

function makeEvent(body: string) {
	return {
		locals: { accessToken: TOKEN, tenantId: TENANT, user: { roles: ['admin'] } },
		params: { caseId: 'case-1' },
		fetch: vi.fn(),
		request: new Request(
			'http://localhost/api/governance/correlation/cases/case-1/create-identity',
			{
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body
			}
		)
	};
}

describe('POST /api/governance/correlation/cases/:caseId/create-identity', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.mocked(hasAdminRole).mockReturnValue(true);
	});

	it('creates an identity from valid JSON', async () => {
		vi.mocked(createIdentityFromCase).mockResolvedValue({ id: 'case-1' } as any);
		const response = await POST(makeEvent(JSON.stringify({ reason: 'new user' })) as any);
		expect(response.status).toBe(200);
		expect(createIdentityFromCase).toHaveBeenCalledWith(
			'case-1',
			{ reason: 'new user' },
			TOKEN,
			TENANT,
			expect.any(Function)
		);
	});

	it('does not create on invalid JSON', async () => {
		await expect(POST(makeEvent('{not json') as any)).rejects.toMatchObject({ status: 400 });
		expect(createIdentityFromCase).not.toHaveBeenCalled();
	});
});
