import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/api/webhooks', () => ({
	listWebhookDeliveries: vi.fn()
}));

import { GET } from './+server';
import { listWebhookDeliveries } from '$lib/api/webhooks';

const TOKEN = 'tok';
const TENANT = 'tid';

describe('GET /api/admin/webhooks/subscriptions/:id/deliveries', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('forwards advertised status filter', async () => {
		vi.mocked(listWebhookDeliveries).mockResolvedValue({ items: [], total: 0 } as any);
		await GET({
			params: { id: 'sub-1' },
			locals: { accessToken: TOKEN, tenantId: TENANT },
			fetch: vi.fn(),
			url: new URL(
				'http://localhost/api/admin/webhooks/subscriptions/sub-1/deliveries?status=failed'
			)
		} as any);
		expect(listWebhookDeliveries).toHaveBeenCalledWith(
			'sub-1',
			expect.objectContaining({ status: 'failed' }),
			TOKEN,
			TENANT,
			expect.any(Function)
		);
	});
});
