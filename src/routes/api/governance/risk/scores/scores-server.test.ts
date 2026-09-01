import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/api/risk', () => ({
	listRiskScores: vi.fn()
}));

import { GET } from './+server';
import { listRiskScores } from '$lib/api/risk';

const TOKEN = 'tok';
const TENANT = 'tid';

describe('GET /api/governance/risk/scores', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.mocked(listRiskScores).mockResolvedValue({ items: [], total: 0 } as any);
	});

	it('forwards advertised min_score and max_score filters', async () => {
		await GET({
			locals: { accessToken: TOKEN, tenantId: TENANT },
			fetch: vi.fn(),
			url: new URL('http://localhost/api/governance/risk/scores?min_score=10&max_score=90')
		} as any);
		expect(listRiskScores).toHaveBeenCalledWith(
			expect.objectContaining({ min_score: 10, max_score: 90 }),
			TOKEN,
			TENANT,
			expect.any(Function)
		);
	});
});
