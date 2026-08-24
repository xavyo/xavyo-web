import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/api/catalog', () => ({
	submitCart: vi.fn()
}));

import { POST } from './+server';
import { submitCart } from '$lib/api/catalog';

const TOKEN = 'tok';
const TENANT = 'tid';

function makeEvent(body: string) {
	return {
		locals: { accessToken: TOKEN, tenantId: TENANT },
		fetch: vi.fn(),
		request: new Request('http://localhost/api/governance/catalog/cart/submit', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body
		})
	};
}

describe('POST /api/governance/catalog/cart/submit', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('submits a valid cart body', async () => {
		vi.mocked(submitCart).mockResolvedValue({ id: 'sub-1' } as any);
		const response = await POST(makeEvent(JSON.stringify({})) as any);
		expect(response.status).toBe(201);
		expect(submitCart).toHaveBeenCalled();
	});

	it('does not submit on invalid JSON', async () => {
		await expect(POST(makeEvent('{not json') as any)).rejects.toMatchObject({ status: 400 });
		expect(submitCart).not.toHaveBeenCalled();
	});
});
