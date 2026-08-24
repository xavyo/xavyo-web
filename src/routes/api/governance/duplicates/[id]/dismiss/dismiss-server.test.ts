import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/api/dedup', () => ({
	dismissDuplicate: vi.fn()
}));

import { POST } from './+server';
import { dismissDuplicate } from '$lib/api/dedup';

const TOKEN = 'tok';
const TENANT = 'tid';

function makeEvent(body: string) {
	return {
		params: { id: 'd1' },
		locals: { accessToken: TOKEN, tenantId: TENANT },
		fetch: vi.fn(),
		request: new Request('http://localhost/api/governance/duplicates/d1/dismiss', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body
		})
	};
}

describe('POST /api/governance/duplicates/:id/dismiss', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('dismisses with required fields', async () => {
		vi.mocked(dismissDuplicate).mockResolvedValue({ id: 'd1' } as any);
		const response = await POST(makeEvent(JSON.stringify({ reason: 'not a dup' })) as any);
		expect(response.status).toBe(200);
		expect(dismissDuplicate).toHaveBeenCalled();
	});

	it('does not dismiss on invalid JSON', async () => {
		await expect(POST(makeEvent('{not json') as any)).rejects.toMatchObject({ status: 400 });
		expect(dismissDuplicate).not.toHaveBeenCalled();
	});

	it('does not dismiss when reason is missing', async () => {
		await expect(POST(makeEvent(JSON.stringify({})) as any)).rejects.toMatchObject({ status: 400 });
		expect(dismissDuplicate).not.toHaveBeenCalled();
	});
});
