import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/api/correlation', () => ({
	listCorrelationCases: vi.fn()
}));

import { GET } from './+server';
import { listCorrelationCases } from '$lib/api/correlation';

const TOKEN = 'tok';
const TENANT = 'tid';

describe('GET /api/governance/correlation/cases', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('does not forward NaN pagination', async () => {
		vi.mocked(listCorrelationCases).mockResolvedValue({ items: [], total: 0 } as any);
		await GET({
			locals: { accessToken: TOKEN, tenantId: TENANT },
			fetch: vi.fn(),
			url: new URL('http://localhost/api/governance/correlation/cases?limit=abc&offset=nope')
		} as any);
		expect(listCorrelationCases).toHaveBeenCalledWith(
			{
				status: undefined,
				connector_id: undefined,
				assigned_to: undefined,
				trigger_type: undefined,
				start_date: undefined,
				end_date: undefined,
				sort_by: undefined,
				sort_order: undefined,
				limit: undefined,
				offset: undefined
			},
			TOKEN,
			TENANT,
			expect.any(Function)
		);
	});
});
