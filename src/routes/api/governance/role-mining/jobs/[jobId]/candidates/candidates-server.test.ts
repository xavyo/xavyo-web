import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/api/role-mining', () => ({
	listCandidates: vi.fn()
}));

import { GET } from './+server';
import { listCandidates } from '$lib/api/role-mining';

const TOKEN = 'tok';
const TENANT = 'tid';

function makeEvent(url: string) {
	return {
		params: { jobId: 'job-1' },
		locals: { accessToken: TOKEN, tenantId: TENANT },
		fetch: vi.fn(),
		url: new URL(url)
	};
}

describe('GET /api/governance/role-mining/jobs/:jobId/candidates', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('forwards advertised status and min_confidence', async () => {
		vi.mocked(listCandidates).mockResolvedValue({ items: [], total: 0 } as any);
		await GET(
			makeEvent(
				'http://localhost/api/governance/role-mining/jobs/job-1/candidates?status=promoted&min_confidence=0.8'
			) as any
		);
		expect(listCandidates).toHaveBeenCalledWith(
			'job-1',
			expect.objectContaining({ status: 'promoted', min_confidence: 0.8 }),
			TOKEN,
			TENANT,
			expect.any(Function)
		);
	});

	it('maps promotion_status alias onto advertised status', async () => {
		vi.mocked(listCandidates).mockResolvedValue({ items: [], total: 0 } as any);
		await GET(
			makeEvent(
				'http://localhost/api/governance/role-mining/jobs/job-1/candidates?promotion_status=pending'
			) as any
		);
		expect(listCandidates).toHaveBeenCalledWith(
			'job-1',
			expect.objectContaining({ status: 'pending' }),
			TOKEN,
			TENANT,
			expect.any(Function)
		);
	});
});
