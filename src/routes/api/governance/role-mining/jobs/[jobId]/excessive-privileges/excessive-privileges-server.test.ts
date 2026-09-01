import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/api/role-mining', () => ({
	listExcessivePrivileges: vi.fn()
}));

import { GET } from './+server';
import { listExcessivePrivileges } from '$lib/api/role-mining';

const TOKEN = 'tok';
const TENANT = 'tid';

describe('GET /api/governance/role-mining/jobs/:jobId/excessive-privileges', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('forwards advertised user_id', async () => {
		vi.mocked(listExcessivePrivileges).mockResolvedValue({ items: [], total: 0 } as any);
		await GET({
			params: { jobId: 'job-1' },
			locals: { accessToken: TOKEN, tenantId: TENANT },
			fetch: vi.fn(),
			url: new URL(
				'http://localhost/api/governance/role-mining/jobs/job-1/excessive-privileges?status=flagged&user_id=user-1'
			)
		} as any);
		expect(listExcessivePrivileges).toHaveBeenCalledWith(
			'job-1',
			expect.objectContaining({ status: 'flagged', user_id: 'user-1' }),
			TOKEN,
			TENANT,
			expect.any(Function)
		);
	});
});
