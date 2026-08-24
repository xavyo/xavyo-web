import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/api/birthright', () => ({
	triggerLifecycleEvent: vi.fn()
}));

import { POST } from './+server';
import { triggerLifecycleEvent } from '$lib/api/birthright';

const TOKEN = 'tok';
const TENANT = 'tid';

function makeEvent(body: string) {
	return {
		locals: { accessToken: TOKEN, tenantId: TENANT },
		fetch: vi.fn(),
		request: new Request('http://localhost/api/governance/lifecycle-events/trigger', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body
		})
	};
}

describe('POST /api/governance/lifecycle-events/trigger', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('triggers a joiner event', async () => {
		vi.mocked(triggerLifecycleEvent).mockResolvedValue({ id: 'ev-1' } as any);
		const response = await POST(
			makeEvent(JSON.stringify({ user_id: 'u1', event_type: 'joiner' })) as any
		);
		expect(response.status).toBe(200);
		expect(triggerLifecycleEvent).toHaveBeenCalled();
	});

	it('does not trigger on invalid JSON', async () => {
		await expect(POST(makeEvent('{not json') as any)).rejects.toMatchObject({ status: 400 });
		expect(triggerLifecycleEvent).not.toHaveBeenCalled();
	});

	it('does not trigger when event_type is missing', async () => {
		await expect(POST(makeEvent(JSON.stringify({ user_id: 'u1' })) as any)).rejects.toMatchObject({
			status: 400
		});
		expect(triggerLifecycleEvent).not.toHaveBeenCalled();
	});
});
