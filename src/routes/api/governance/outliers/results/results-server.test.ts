import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/api/outliers', () => ({
	listOutlierResults: vi.fn()
}));

import { GET } from './+server';
import { listOutlierResults } from '$lib/api/outliers';

const TOKEN = 'tok';
const TENANT = 'tid';

describe('GET /api/governance/outliers/results', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('does not forward NaN score filters', async () => {
		vi.mocked(listOutlierResults).mockResolvedValue({ items: [], total: 0 } as any);
		await GET({
			locals: { accessToken: TOKEN, tenantId: TENANT },
			fetch: vi.fn(),
			url: new URL('http://localhost/api/governance/outliers/results?min_score=abc&max_score=nope')
		} as any);
		expect(listOutlierResults).toHaveBeenCalledWith(
			{
				analysis_id: undefined,
				user_id: undefined,
				classification: undefined,
				min_score: undefined,
				max_score: undefined,
				limit: undefined,
				offset: undefined
			},
			TOKEN,
			TENANT,
			expect.any(Function)
		);
	});
});
