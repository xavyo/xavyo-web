import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/api/outliers', () => ({
	createDisposition: vi.fn()
}));

import { POST } from './+server';
import { createDisposition } from '$lib/api/outliers';

const TOKEN = 'tok';
const TENANT = 'tid';

function makeEvent(body: string) {
	return {
		params: { id: 'r1' },
		locals: { accessToken: TOKEN, tenantId: TENANT },
		fetch: vi.fn(),
		request: new Request('http://localhost/api/governance/outliers/results/r1/disposition', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body
		})
	};
}

describe('POST /api/governance/outliers/results/:id/disposition', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('creates a disposition with required fields', async () => {
		vi.mocked(createDisposition).mockResolvedValue({ id: 'd1' } as any);
		const response = await POST(makeEvent(JSON.stringify({ status: 'legitimate' })) as any);
		expect(response.status).toBe(201);
		expect(createDisposition).toHaveBeenCalled();
	});

	it('does not create on invalid JSON', async () => {
		await expect(POST(makeEvent('{not json') as any)).rejects.toMatchObject({ status: 400 });
		expect(createDisposition).not.toHaveBeenCalled();
	});

	it('does not create when status is missing', async () => {
		await expect(POST(makeEvent(JSON.stringify({})) as any)).rejects.toMatchObject({ status: 400 });
		expect(createDisposition).not.toHaveBeenCalled();
	});
});
