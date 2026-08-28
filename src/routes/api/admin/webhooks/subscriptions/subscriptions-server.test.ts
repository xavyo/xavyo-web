import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/api/webhooks', () => ({
	listWebhookSubscriptions: vi.fn(),
	createWebhookSubscription: vi.fn()
}));

import { GET, POST } from './+server';
import { createWebhookSubscription, listWebhookSubscriptions } from '$lib/api/webhooks';

const TOKEN = 'tok';
const TENANT = 'tid';

function makeEvent(body: string) {
	return {
		locals: { accessToken: TOKEN, tenantId: TENANT },
		fetch: vi.fn(),
		request: new Request('http://localhost/api/admin/webhooks/subscriptions', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body
		})
	};
}

describe('GET /api/admin/webhooks/subscriptions', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('maps page/page_size onto limit/offset', async () => {
		vi.mocked(listWebhookSubscriptions).mockResolvedValue({ items: [], total: 0 } as any);
		await GET({
			locals: { accessToken: TOKEN, tenantId: TENANT },
			fetch: vi.fn(),
			url: new URL('http://localhost/api/admin/webhooks/subscriptions?page=2&page_size=20')
		} as any);
		expect(listWebhookSubscriptions).toHaveBeenCalledWith(
			{ limit: 20, offset: 20 },
			TOKEN,
			TENANT,
			expect.any(Function)
		);
	});
});

describe('POST /api/admin/webhooks/subscriptions', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('creates a subscription with required fields', async () => {
		vi.mocked(createWebhookSubscription).mockResolvedValue({ id: 'wh-1' } as any);
		const response = await POST(
			makeEvent(JSON.stringify({ name: 'n', url: 'https://ex', event_types: ['user.created'] })) as any
		);
		expect(response.status).toBe(201);
		expect(createWebhookSubscription).toHaveBeenCalled();
	});

	it('does not create on invalid JSON', async () => {
		await expect(POST(makeEvent('{not json') as any)).rejects.toMatchObject({ status: 400 });
		expect(createWebhookSubscription).not.toHaveBeenCalled();
	});

	it('does not create when url is missing', async () => {
		await expect(
			POST(makeEvent(JSON.stringify({ name: 'n', event_types: ['user.created'] })) as any)
		).rejects.toMatchObject({ status: 400 });
		expect(createWebhookSubscription).not.toHaveBeenCalled();
	});
});
