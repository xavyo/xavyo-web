import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/api/governance', () => ({
	listSodViolations: vi.fn()
}));

import { GET } from './+server';
import { listSodViolations } from '$lib/api/governance';

const TOKEN = 'tok';
const TENANT = 'tid';

describe('GET /api/governance/sod-violations', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.mocked(listSodViolations).mockResolvedValue({ items: [], total: 0 } as any);
	});

	it('forwards advertised SoD violation list filters', async () => {
		await GET({
			locals: { accessToken: TOKEN, tenantId: TENANT },
			fetch: vi.fn(),
			url: new URL(
				'http://localhost/api/governance/sod-violations?rule_id=r1&user_id=u1&status=open&detected_after=2024-01-01T00:00:00Z&detected_before=2024-02-01T00:00:00Z'
			)
		} as any);
		expect(listSodViolations).toHaveBeenCalledWith(
			expect.objectContaining({
				rule_id: 'r1',
				user_id: 'u1',
				status: 'open',
				detected_after: '2024-01-01T00:00:00Z',
				detected_before: '2024-02-01T00:00:00Z'
			}),
			TOKEN,
			TENANT,
			expect.any(Function)
		);
	});
});
