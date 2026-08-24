import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/server/auth', () => ({
	hasAdminRole: vi.fn().mockReturnValue(true)
}));

vi.mock('$lib/api/correlation', () => ({
	reassignCorrelationCase: vi.fn()
}));

import { POST } from './+server';
import { reassignCorrelationCase } from '$lib/api/correlation';
import { hasAdminRole } from '$lib/server/auth';

const TOKEN = 'tok';
const TENANT = 'tid';

function makeEvent(body: string) {
	return {
		locals: { accessToken: TOKEN, tenantId: TENANT, user: { roles: ['admin'] } },
		params: { caseId: 'case-1' },
		fetch: vi.fn(),
		request: new Request('http://localhost/api/governance/correlation/cases/case-1/reassign', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body
		})
	};
}

describe('POST /api/governance/correlation/cases/:caseId/reassign', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.mocked(hasAdminRole).mockReturnValue(true);
	});

	it('reassigns with assigned_to', async () => {
		vi.mocked(reassignCorrelationCase).mockResolvedValue({ id: 'case-1' } as any);
		const response = await POST(makeEvent(JSON.stringify({ assigned_to: 'u1' })) as any);
		expect(response.status).toBe(200);
		expect(reassignCorrelationCase).toHaveBeenCalledWith(
			'case-1',
			{ assigned_to: 'u1', reason: undefined },
			TOKEN,
			TENANT,
			expect.any(Function)
		);
	});

	it('does not reassign on invalid JSON', async () => {
		await expect(POST(makeEvent('{not json') as any)).rejects.toMatchObject({ status: 400 });
		expect(reassignCorrelationCase).not.toHaveBeenCalled();
	});

	it('does not reassign when assigned_to is missing', async () => {
		await expect(POST(makeEvent(JSON.stringify({})) as any)).rejects.toMatchObject({
			status: 400
		});
		expect(reassignCorrelationCase).not.toHaveBeenCalled();
	});
});
