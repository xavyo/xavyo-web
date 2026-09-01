import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/api/micro-certifications', () => ({
	getMicroCertificationEvents: vi.fn()
}));

import { GET } from './+server';
import { getMicroCertificationEvents } from '$lib/api/micro-certifications';

const TOKEN = 'tok';
const TENANT = 'tid';

describe('GET /api/governance/micro-certifications/:id/events', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.mocked(getMicroCertificationEvents).mockResolvedValue({ items: [], total: 0 } as any);
	});

	it('forwards advertised event filters and pagination', async () => {
		const response = await GET({
			params: { id: 'mc-1' },
			locals: { accessToken: TOKEN, tenantId: TENANT },
			fetch: vi.fn(),
			url: new URL(
				'http://localhost/api/governance/micro-certifications/mc-1/events?event_type=approved&actor_id=u1&from_date=2026-01-01&to_date=2026-02-01&limit=20&offset=5'
			)
		} as any);
		expect(response.status).toBe(200);
		expect(getMicroCertificationEvents).toHaveBeenCalledWith(
			'mc-1',
			TOKEN,
			TENANT,
			expect.any(Function),
			expect.objectContaining({
				event_type: 'approved',
				actor_id: 'u1',
				from_date: '2026-01-01',
				to_date: '2026-02-01',
				limit: 20,
				offset: 5
			})
		);
	});
});
