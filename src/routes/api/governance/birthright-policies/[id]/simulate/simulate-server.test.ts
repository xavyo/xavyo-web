import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/api/birthright', () => ({
	simulatePolicy: vi.fn()
}));

import { POST } from './+server';
import { simulatePolicy } from '$lib/api/birthright';

const TOKEN = 'tok';
const TENANT = 'tid';

function makeEvent(body: string) {
	return {
		params: { id: 'p1' },
		locals: { accessToken: TOKEN, tenantId: TENANT },
		fetch: vi.fn(),
		request: new Request('http://localhost/api/governance/birthright-policies/p1/simulate', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body
		})
	};
}

describe('POST /api/governance/birthright-policies/:id/simulate', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('simulates with required fields', async () => {
		vi.mocked(simulatePolicy).mockResolvedValue({ matches: true } as any);
		const response = await POST(makeEvent(JSON.stringify({ attributes: { dept: 'eng' } })) as any);
		expect(response.status).toBe(200);
		expect(simulatePolicy).toHaveBeenCalled();
	});

	it('does not simulate on invalid JSON', async () => {
		await expect(POST(makeEvent('{not json') as any)).rejects.toMatchObject({ status: 400 });
		expect(simulatePolicy).not.toHaveBeenCalled();
	});

	it('does not simulate when attributes is missing', async () => {
		await expect(POST(makeEvent(JSON.stringify({})) as any)).rejects.toMatchObject({ status: 400 });
		expect(simulatePolicy).not.toHaveBeenCalled();
	});
});
