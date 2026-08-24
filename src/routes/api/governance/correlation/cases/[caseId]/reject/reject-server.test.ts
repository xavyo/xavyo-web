import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/server/auth', () => ({
	hasAdminRole: vi.fn().mockReturnValue(true)
}));

vi.mock('$lib/api/correlation', () => ({
	rejectCorrelationCase: vi.fn()
}));

import { POST } from './+server';
import { rejectCorrelationCase } from '$lib/api/correlation';
import { hasAdminRole } from '$lib/server/auth';

const TOKEN = 'tok';
const TENANT = 'tid';

function makeEvent(body: string) {
	return {
		locals: { accessToken: TOKEN, tenantId: TENANT, user: { roles: ['admin'] } },
		params: { caseId: 'case-1' },
		fetch: vi.fn(),
		request: new Request('http://localhost/api/governance/correlation/cases/case-1/reject', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body
		})
	};
}

describe('POST /api/governance/correlation/cases/:caseId/reject', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.mocked(hasAdminRole).mockReturnValue(true);
	});

	it('rejects with a reason', async () => {
		vi.mocked(rejectCorrelationCase).mockResolvedValue({ id: 'case-1' } as any);
		const response = await POST(makeEvent(JSON.stringify({ reason: 'no match' })) as any);
		expect(response.status).toBe(200);
		expect(rejectCorrelationCase).toHaveBeenCalledWith(
			'case-1',
			{ reason: 'no match' },
			TOKEN,
			TENANT,
			expect.any(Function)
		);
	});

	it('does not reject on invalid JSON', async () => {
		await expect(POST(makeEvent('{not json') as any)).rejects.toMatchObject({ status: 400 });
		expect(rejectCorrelationCase).not.toHaveBeenCalled();
	});

	it('does not reject when reason is missing', async () => {
		await expect(POST(makeEvent(JSON.stringify({})) as any)).rejects.toMatchObject({
			status: 400
		});
		expect(rejectCorrelationCase).not.toHaveBeenCalled();
	});
});
