import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/api/role-mining', () => ({
	listConsolidationSuggestions: vi.fn()
}));

import { GET } from './+server';
import { listConsolidationSuggestions } from '$lib/api/role-mining';

const TOKEN = 'tok';
const TENANT = 'tid';

describe('GET /api/governance/role-mining/jobs/:jobId/consolidation-suggestions', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('forwards advertised min_overlap', async () => {
		vi.mocked(listConsolidationSuggestions).mockResolvedValue({ items: [], total: 0 } as any);
		await GET({
			params: { jobId: 'job-1' },
			locals: { accessToken: TOKEN, tenantId: TENANT },
			fetch: vi.fn(),
			url: new URL(
				'http://localhost/api/governance/role-mining/jobs/job-1/consolidation-suggestions?status=pending&min_overlap=0.7'
			)
		} as any);
		expect(listConsolidationSuggestions).toHaveBeenCalledWith(
			'job-1',
			expect.objectContaining({ status: 'pending', min_overlap: 0.7 }),
			TOKEN,
			TENANT,
			expect.any(Function)
		);
	});
});
