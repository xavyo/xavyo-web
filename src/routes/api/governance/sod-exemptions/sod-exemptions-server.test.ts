import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/api/approval-workflows', () => ({
	listSodExemptions: vi.fn(),
	createSodExemption: vi.fn()
}));

import { POST } from './+server';
import { createSodExemption } from '$lib/api/approval-workflows';

const TOKEN = 'tok';
const TENANT = 'tid';

function makeEvent(body: string) {
	return {
		locals: { accessToken: TOKEN, tenantId: TENANT },
		fetch: vi.fn(),
		request: new Request('http://localhost/api/governance/sod-exemptions', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body
		})
	};
}

describe('POST /api/governance/sod-exemptions', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('creates an exemption with required fields', async () => {
		vi.mocked(createSodExemption).mockResolvedValue({ id: 'x1' } as any);
		const response = await POST(
			makeEvent(
				JSON.stringify({
					rule_id: 'r1',
					user_id: 'u1',
					justification: 'need',
					expires_at: '2026-01-01'
				})
			) as any
		);
		expect(response.status).toBe(201);
		expect(createSodExemption).toHaveBeenCalled();
	});

	it('does not create on invalid JSON', async () => {
		await expect(POST(makeEvent('{not json') as any)).rejects.toMatchObject({ status: 400 });
		expect(createSodExemption).not.toHaveBeenCalled();
	});

	it('does not create when justification is missing', async () => {
		await expect(
			POST(makeEvent(JSON.stringify({ rule_id: 'r1', user_id: 'u1' })) as any)
		).rejects.toMatchObject({ status: 400 });
		expect(createSodExemption).not.toHaveBeenCalled();
	});
});
