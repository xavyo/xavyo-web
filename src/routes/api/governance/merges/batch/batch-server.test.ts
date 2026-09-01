import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/api/dedup', () => ({
	executeBatchMerge: vi.fn()
}));

import { POST } from './+server';
import { executeBatchMerge } from '$lib/api/dedup';

const TOKEN = 'tok';
const TENANT = 'tid';

function makeEvent(body: string) {
	return {
		locals: { accessToken: TOKEN, tenantId: TENANT, user: { roles: ['admin'] } },
		fetch: vi.fn(),
		request: new Request('http://localhost/api/governance/merges/batch', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body
		})
	};
}

describe('POST /api/governance/merges/batch', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('executes a valid batch merge', async () => {
		vi.mocked(executeBatchMerge).mockResolvedValue({ id: 'batch-1' } as any);
		const response = await POST(
			makeEvent(
				JSON.stringify({
					candidate_ids: ['c1'],
					entitlement_strategy: 'union',
					attribute_rule: 'newest_wins'
				})
			) as any
		);
		expect(response.status).toBe(200);
		expect(executeBatchMerge).toHaveBeenCalled();
	});

	it('does not execute on invalid JSON', async () => {
		await expect(POST(makeEvent('{not json') as any)).rejects.toMatchObject({ status: 400 });
		expect(executeBatchMerge).not.toHaveBeenCalled();
	});

	it('does not execute when candidate_ids is missing', async () => {
		await expect(POST(makeEvent(JSON.stringify({})) as any)).rejects.toMatchObject({
			status: 400
		});
		expect(executeBatchMerge).not.toHaveBeenCalled();
	});

	it('rejects NaN min_confidence instead of forwarding it', async () => {
		await expect(
			POST(
				makeEvent(
					JSON.stringify({
						candidate_ids: ['c1'],
						entitlement_strategy: 'union',
						attribute_rule: 'newest_wins',
						min_confidence: Number.NaN
					})
				) as any
			)
		).rejects.toMatchObject({ status: 400 });
		expect(executeBatchMerge).not.toHaveBeenCalled();
	});
});
