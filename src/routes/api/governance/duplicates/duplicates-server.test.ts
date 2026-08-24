import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/api/dedup', () => ({
	listDuplicates: vi.fn(),
	detectDuplicates: vi.fn()
}));

import { POST } from './+server';
import { detectDuplicates } from '$lib/api/dedup';

const TOKEN = 'tok';
const TENANT = 'tid';

function makeEvent(body: string) {
	return {
		locals: { accessToken: TOKEN, tenantId: TENANT },
		fetch: vi.fn(),
		request: new Request('http://localhost/api/governance/duplicates', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body
		})
	};
}

describe('POST /api/governance/duplicates', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('detects with known fields', async () => {
		vi.mocked(detectDuplicates).mockResolvedValue({ duplicates_found: 1 } as any);
		const response = await POST(makeEvent(JSON.stringify({ min_confidence: 80 })) as any);
		expect(response.status).toBe(200);
		expect(detectDuplicates).toHaveBeenCalled();
	});

	it('does not detect on invalid JSON', async () => {
		await expect(POST(makeEvent('{not json') as any)).rejects.toMatchObject({ status: 400 });
		expect(detectDuplicates).not.toHaveBeenCalled();
	});

	it('does not detect when min_confidence is not a number', async () => {
		await expect(
			POST(makeEvent(JSON.stringify({ min_confidence: 'high' })) as any)
		).rejects.toMatchObject({ status: 400 });
		expect(detectDuplicates).not.toHaveBeenCalled();
	});
});
