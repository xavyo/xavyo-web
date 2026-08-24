import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/api/webhooks', () => ({
	getWebhookSubscription: vi.fn(),
	updateWebhookSubscription: vi.fn(),
	deleteWebhookSubscription: vi.fn()
}));

import { PATCH } from './+server';
import { updateWebhookSubscription } from '$lib/api/webhooks';

const TOKEN = 'tok';
const TENANT = 'tid';

function makeEvent(body: string) {
	return {
		params: { id: 'w1' },
		locals: { accessToken: TOKEN, tenantId: TENANT },
		fetch: vi.fn(),
		request: new Request('http://localhost/api/admin/webhooks/subscriptions/w1', {
			method: 'PATCH',
			headers: { 'Content-Type': 'application/json' },
			body
		})
	};
}

describe('PATCH /api/admin/webhooks/subscriptions/:id', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('updates a subscription with known fields', async () => {
		vi.mocked(updateWebhookSubscription).mockResolvedValue({ id: 'w1' } as any);
		const response = await PATCH(makeEvent(JSON.stringify({ name: 'n', enabled: false })) as any);
		expect(response.status).toBe(200);
		expect(updateWebhookSubscription).toHaveBeenCalled();
	});

	it('does not update on invalid JSON', async () => {
		await expect(PATCH(makeEvent('{not json') as any)).rejects.toMatchObject({ status: 400 });
		expect(updateWebhookSubscription).not.toHaveBeenCalled();
	});

	it('does not update when url is empty', async () => {
		await expect(PATCH(makeEvent(JSON.stringify({ url: '' })) as any)).rejects.toMatchObject({
			status: 400
		});
		expect(updateWebhookSubscription).not.toHaveBeenCalled();
	});
});
