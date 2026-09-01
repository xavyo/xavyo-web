import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/api/webhooks', () => ({
	listDlqEntries: vi.fn()
}));

import { GET } from './+server';
import { listDlqEntries } from '$lib/api/webhooks';

const TOKEN = 'tok';
const TENANT = 'tid';

describe('GET /api/admin/webhooks/dlq', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('forwards advertised DLQ list filters', async () => {
		vi.mocked(listDlqEntries).mockResolvedValue({ items: [], total: 0 } as any);
		await GET({
			locals: { accessToken: TOKEN, tenantId: TENANT },
			fetch: vi.fn(),
			url: new URL(
				'http://localhost/api/admin/webhooks/dlq?subscription_id=sub-1&event_type=user.created&from=2024-01-01T00:00:00Z&to=2024-02-01T00:00:00Z&include_replayed=true'
			)
		} as any);
		expect(listDlqEntries).toHaveBeenCalledWith(
			expect.objectContaining({
				subscription_id: 'sub-1',
				event_type: 'user.created',
				from: '2024-01-01T00:00:00Z',
				to: '2024-02-01T00:00:00Z',
				include_replayed: true
			}),
			TOKEN,
			TENANT,
			expect.any(Function)
		);
	});
});
