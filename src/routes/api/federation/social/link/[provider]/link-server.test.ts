import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/api/client', () => ({
	apiClient: vi.fn()
}));

import { POST } from './+server';
import { apiClient } from '$lib/api/client';

const TOKEN = 'tok';
const TENANT = 'tid';

function makeEvent(body: string) {
	return {
		params: { provider: 'google' },
		locals: { accessToken: TOKEN, tenantId: TENANT },
		fetch: vi.fn(),
		request: new Request('http://localhost/api/federation/social/link/google', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body
		})
	};
}

describe('POST /api/federation/social/link/:provider', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('links with required fields', async () => {
		vi.mocked(apiClient).mockResolvedValue({ linked: true } as any);
		const response = await POST(makeEvent(JSON.stringify({ code: 'c', state: 's' })) as any);
		expect(response.status).toBe(200);
		expect(apiClient).toHaveBeenCalled();
	});

	it('does not link on invalid JSON', async () => {
		await expect(POST(makeEvent('{not json') as any)).rejects.toMatchObject({ status: 400 });
		expect(apiClient).not.toHaveBeenCalled();
	});

	it('does not link when code is missing', async () => {
		await expect(POST(makeEvent(JSON.stringify({ state: 's' })) as any)).rejects.toMatchObject({
			status: 400
		});
		expect(apiClient).not.toHaveBeenCalled();
	});
});
