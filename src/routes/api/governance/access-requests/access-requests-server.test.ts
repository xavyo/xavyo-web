import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/api/access-requests', () => ({
	listAccessRequests: vi.fn(),
	createAccessRequest: vi.fn()
}));

import { POST } from './+server';
import { createAccessRequest } from '$lib/api/access-requests';

const TOKEN = 'tok';
const TENANT = 'tid';

function makeEvent(body: string) {
	return {
		locals: { accessToken: TOKEN, tenantId: TENANT },
		fetch: vi.fn(),
		request: new Request('http://localhost/api/governance/access-requests', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body
		})
	};
}

describe('POST /api/governance/access-requests', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('creates a request with required fields', async () => {
		vi.mocked(createAccessRequest).mockResolvedValue({ id: 'a1' } as any);
		const response = await POST(
			makeEvent(JSON.stringify({ entitlement_id: 'e1', justification: 'need' })) as any
		);
		expect(response.status).toBe(201);
		expect(createAccessRequest).toHaveBeenCalled();
	});

	it('does not create on invalid JSON', async () => {
		await expect(POST(makeEvent('{not json') as any)).rejects.toMatchObject({ status: 400 });
		expect(createAccessRequest).not.toHaveBeenCalled();
	});

	it('does not create when justification is missing', async () => {
		await expect(POST(makeEvent(JSON.stringify({ entitlement_id: 'e1' })) as any)).rejects.toMatchObject(
			{ status: 400 }
		);
		expect(createAccessRequest).not.toHaveBeenCalled();
	});
});
