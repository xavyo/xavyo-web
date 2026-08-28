import { describe, it, expect, vi, beforeEach } from 'vitest';

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

import { GET } from './+server';
import { listRiskScores } from '$lib/api/risk';

const TOKEN = 'tok';
const TENANT = 'tid';

describe('GET /api/risk/scores', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('does not forward NaN score filters', async () => {
		vi.mocked(listRiskScores).mockResolvedValue({ items: [], total: 0 } as any);
		await GET({
			locals: { accessToken: TOKEN, tenantId: TENANT },
			fetch: vi.fn(),
			url: new URL('http://localhost/api/risk/scores?min_score=abc&max_score=nope')
		} as any);
		expect(listRiskScores).toHaveBeenCalledWith(
			{
				risk_level: undefined,
				min_score: undefined,
				max_score: undefined,
				sort_by: undefined,
				limit: undefined,
				offset: undefined
			},
			TOKEN,
			TENANT,
			expect.any(Function)
		);
	});
});
