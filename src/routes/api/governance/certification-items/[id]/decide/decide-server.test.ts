import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/api/governance', () => ({
	decideCertificationItem: vi.fn()
}));

import { POST } from './+server';
import { decideCertificationItem } from '$lib/api/governance';

const TOKEN = 'tok';
const TENANT = 'tid';

function makeEvent(body: string) {
	return {
		params: { id: 'i1' },
		locals: { accessToken: TOKEN, tenantId: TENANT },
		fetch: vi.fn(),
		request: new Request('http://localhost/api/governance/certification-items/i1/decide', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body
		})
	};
}

describe('POST /api/governance/certification-items/:id/decide', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('decides with required fields', async () => {
		vi.mocked(decideCertificationItem).mockResolvedValue({ id: 'i1' } as any);
		const response = await POST(makeEvent(JSON.stringify({ decision: 'approved' })) as any);
		expect(response.status).toBe(200);
		expect(decideCertificationItem).toHaveBeenCalled();
	});

	it('does not decide on invalid JSON', async () => {
		await expect(POST(makeEvent('{not json') as any)).rejects.toMatchObject({ status: 400 });
		expect(decideCertificationItem).not.toHaveBeenCalled();
	});

	it('does not decide when decision is invalid', async () => {
		await expect(POST(makeEvent(JSON.stringify({ decision: 'maybe' })) as any)).rejects.toMatchObject({
			status: 400
		});
		expect(decideCertificationItem).not.toHaveBeenCalled();
	});
});
