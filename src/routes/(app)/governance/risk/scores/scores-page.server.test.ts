import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/server/auth', () => ({
	hasAdminRole: vi.fn().mockReturnValue(true)
}));

vi.mock('$lib/api/risk', () => ({
	listRiskScores: vi.fn()
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

import { load } from './+page.server';
import { listRiskScores } from '$lib/api/risk';
import { hasAdminRole } from '$lib/server/auth';

const TOKEN = 'tok';
const TENANT = 'tid';

describe('load /governance/risk/scores', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.mocked(hasAdminRole).mockReturnValue(true);
	});

	it('does not forward NaN score filters or pagination', async () => {
		vi.mocked(listRiskScores).mockResolvedValue({ items: [], total: 0 } as any);
		await load({
			locals: { accessToken: TOKEN, tenantId: TENANT, user: { roles: ['admin'] } },
			fetch: vi.fn(),
			url: new URL(
				'http://localhost/governance/risk/scores?min_score=abc&max_score=nope&limit=foo&offset=bar'
			)
		} as any);
		expect(listRiskScores).toHaveBeenCalledWith(
			{
				risk_level: undefined,
				min_score: undefined,
				max_score: undefined,
				sort_by: 'score_desc',
				limit: 50,
				offset: 0
			},
			TOKEN,
			TENANT,
			expect.any(Function)
		);
	});
});
