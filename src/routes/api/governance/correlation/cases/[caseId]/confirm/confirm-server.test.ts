import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/server/auth', () => ({
	hasAdminRole: vi.fn().mockReturnValue(true)
}));

vi.mock('$lib/api/correlation', () => ({
	confirmCorrelationCase: vi.fn()
}));

import { POST } from './+server';
import { confirmCorrelationCase } from '$lib/api/correlation';
import { hasAdminRole } from '$lib/server/auth';

const TOKEN = 'tok';
const TENANT = 'tid';

function makeEvent(body: string) {
	return {
		locals: { accessToken: TOKEN, tenantId: TENANT, user: { roles: ['admin'] } },
		params: { caseId: 'case-1' },
		fetch: vi.fn(),
		request: new Request('http://localhost/api/governance/correlation/cases/case-1/confirm', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body
		})
	};
}

describe('POST /api/governance/correlation/cases/:caseId/confirm', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.mocked(hasAdminRole).mockReturnValue(true);
	});

	it('confirms with a candidate_id', async () => {
		vi.mocked(confirmCorrelationCase).mockResolvedValue({ id: 'case-1' } as any);
		const response = await POST(makeEvent(JSON.stringify({ candidate_id: 'cand-1' })) as any);
		expect(response.status).toBe(200);
		expect(confirmCorrelationCase).toHaveBeenCalledWith(
			'case-1',
			{ candidate_id: 'cand-1', reason: undefined },
			TOKEN,
			TENANT,
			expect.any(Function)
		);
	});

	it('does not confirm on invalid JSON', async () => {
		await expect(POST(makeEvent('{not json') as any)).rejects.toMatchObject({ status: 400 });
		expect(confirmCorrelationCase).not.toHaveBeenCalled();
	});

	it('does not confirm when candidate_id is missing', async () => {
		await expect(POST(makeEvent(JSON.stringify({})) as any)).rejects.toMatchObject({
			status: 400
		});
		expect(confirmCorrelationCase).not.toHaveBeenCalled();
	});
});
