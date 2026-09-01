import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/api/governance', () => ({
	listDelegationAudit: vi.fn()
}));

import { GET } from './+server';
import { listDelegationAudit } from '$lib/api/governance';

const TOKEN = 'tok';
const TENANT = 'tid';

describe('GET /api/governance/delegations/audit', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('forwards advertised date filters', async () => {
		vi.mocked(listDelegationAudit).mockResolvedValue({ items: [], total: 0, limit: 50, offset: 0 });
		await GET({
			locals: { accessToken: TOKEN, tenantId: TENANT },
			fetch: vi.fn(),
			url: new URL(
				'http://localhost/api/governance/delegations/audit?delegation_id=d-1&from_date=2026-01-01T00:00:00Z&to_date=2026-01-31T23:59:59Z'
			)
		} as any);
		expect(listDelegationAudit).toHaveBeenCalledWith(
			expect.objectContaining({
				delegation_id: 'd-1',
				from_date: '2026-01-01T00:00:00Z',
				to_date: '2026-01-31T23:59:59Z'
			}),
			TOKEN,
			TENANT,
			expect.any(Function)
		);
	});
});
