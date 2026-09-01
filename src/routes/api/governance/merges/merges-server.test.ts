import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/api/dedup', () => ({
	listMergeOperations: vi.fn()
}));

import { GET } from './+server';
import { listMergeOperations } from '$lib/api/dedup';

const TOKEN = 'tok';
const TENANT = 'tid';

describe('GET /api/governance/merges', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('forwards advertised status and identity_id filters', async () => {
		vi.mocked(listMergeOperations).mockResolvedValue({ items: [], total: 0 } as any);
		await GET({
			locals: { accessToken: TOKEN, tenantId: TENANT },
			fetch: vi.fn(),
			url: new URL(
				'http://localhost/api/governance/merges?status=completed&identity_id=id-1'
			)
		} as any);
		expect(listMergeOperations).toHaveBeenCalledWith(
			expect.objectContaining({ status: 'completed', identity_id: 'id-1' }),
			TOKEN,
			TENANT,
			expect.any(Function)
		);
	});
});
