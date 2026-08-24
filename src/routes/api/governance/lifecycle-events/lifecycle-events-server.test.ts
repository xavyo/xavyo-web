import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/api/birthright', () => ({
	listLifecycleEvents: vi.fn(),
	createLifecycleEvent: vi.fn()
}));

import { POST } from './+server';
import { createLifecycleEvent } from '$lib/api/birthright';

const TOKEN = 'tok';
const TENANT = 'tid';

function makeEvent(body: string) {
	return {
		locals: { accessToken: TOKEN, tenantId: TENANT },
		fetch: vi.fn(),
		request: new Request('http://localhost/api/governance/lifecycle-events', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body
		})
	};
}

describe('POST /api/governance/lifecycle-events', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('creates an event with required fields', async () => {
		vi.mocked(createLifecycleEvent).mockResolvedValue({ id: 'e1' } as any);
		const response = await POST(
			makeEvent(JSON.stringify({ user_id: 'u1', event_type: 'joiner' })) as any
		);
		expect(response.status).toBe(201);
		expect(createLifecycleEvent).toHaveBeenCalled();
	});

	it('does not create on invalid JSON', async () => {
		await expect(POST(makeEvent('{not json') as any)).rejects.toMatchObject({ status: 400 });
		expect(createLifecycleEvent).not.toHaveBeenCalled();
	});

	it('does not create when user_id is missing', async () => {
		await expect(POST(makeEvent(JSON.stringify({ event_type: 'joiner' })) as any)).rejects.toMatchObject({
			status: 400
		});
		expect(createLifecycleEvent).not.toHaveBeenCalled();
	});
});
