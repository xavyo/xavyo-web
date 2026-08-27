import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/api/my-certifications', () => ({
	revokeItem: vi.fn()
}));

import { POST } from './+server';
import { revokeItem } from '$lib/api/my-certifications';

const TOKEN = 'tok';
const TENANT = 'tid';

function makeEvent(body: string) {
	return {
		params: { itemId: 'item-1' },
		locals: { accessToken: TOKEN, tenantId: TENANT },
		fetch: vi.fn(),
		request: new Request('http://localhost/api/governance/my-certifications/item-1/revoke', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body
		})
	};
}

describe('POST /api/governance/my-certifications/:itemId/revoke', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('revokes with a justification', async () => {
		vi.mocked(revokeItem).mockResolvedValue({ id: 'item-1' } as any);
		const justification = 'This access is no longer required.';
		const response = await POST(makeEvent(JSON.stringify({ justification })) as any);
		expect(response.status).toBe(200);
		expect(revokeItem).toHaveBeenCalledWith(
			'item-1',
			justification,
			TOKEN,
			TENANT,
			expect.any(Function)
		);
	});

	it('rejects a short justification', async () => {
		await expect(POST(makeEvent(JSON.stringify({ justification: 'too short' })) as any)).rejects.toMatchObject(
			{ status: 400 }
		);
		expect(revokeItem).not.toHaveBeenCalled();
	});
});
