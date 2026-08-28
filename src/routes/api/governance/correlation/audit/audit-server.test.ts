import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/api/correlation', () => ({
	listCorrelationAuditEvents: vi.fn()
}));

import { GET } from './+server';
import { listCorrelationAuditEvents } from '$lib/api/correlation';

const TOKEN = 'tok';
const TENANT = 'tid';

describe('GET /api/governance/correlation/audit', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('does not forward NaN pagination', async () => {
		vi.mocked(listCorrelationAuditEvents).mockResolvedValue({ items: [], total: 0 } as any);
		await GET({
			locals: { accessToken: TOKEN, tenantId: TENANT },
			fetch: vi.fn(),
			url: new URL('http://localhost/api/governance/correlation/audit?limit=abc&offset=nope')
		} as any);
		expect(listCorrelationAuditEvents).toHaveBeenCalledWith(
			{
				connector_id: undefined,
				event_type: undefined,
				outcome: undefined,
				start_date: undefined,
				end_date: undefined,
				actor_id: undefined,
				limit: undefined,
				offset: undefined
			},
			TOKEN,
			TENANT,
			expect.any(Function)
		);
	});
});
