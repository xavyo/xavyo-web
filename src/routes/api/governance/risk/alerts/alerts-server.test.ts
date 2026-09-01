import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/api/risk', () => ({
	listRiskAlerts: vi.fn()
}));

import { GET } from './+server';
import { listRiskAlerts } from '$lib/api/risk';

const TOKEN = 'tok';
const TENANT = 'tid';

describe('GET /api/governance/risk/alerts', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.mocked(listRiskAlerts).mockResolvedValue({ items: [], total: 0 } as any);
	});

	it('forwards advertised risk alert list filters', async () => {
		await GET({
			locals: { accessToken: TOKEN, tenantId: TENANT },
			fetch: vi.fn(),
			url: new URL(
				'http://localhost/api/governance/risk/alerts?user_id=u1&threshold_id=t1&severity=high&acknowledged=false&sort_by=created_at'
			)
		} as any);
		expect(listRiskAlerts).toHaveBeenCalledWith(
			expect.objectContaining({
				user_id: 'u1',
				threshold_id: 't1',
				severity: 'high',
				acknowledged: false,
				sort_by: 'created_at'
			}),
			TOKEN,
			TENANT,
			expect.any(Function)
		);
	});
});
