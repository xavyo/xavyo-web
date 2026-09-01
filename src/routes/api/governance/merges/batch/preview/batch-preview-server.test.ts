import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/api/dedup', () => ({
	previewBatchMerge: vi.fn()
}));

import { POST } from './+server';
import { previewBatchMerge } from '$lib/api/dedup';

const TOKEN = 'tok';
const TENANT = 'tid';

function makeEvent(body: string) {
	return {
		locals: { accessToken: TOKEN, tenantId: TENANT },
		fetch: vi.fn(),
		request: new Request('http://localhost/api/governance/merges/batch/preview', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body
		})
	};
}

describe('POST /api/governance/merges/batch/preview', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('previews with required fields', async () => {
		vi.mocked(previewBatchMerge).mockResolvedValue({ ok: true } as any);
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
		expect(previewBatchMerge).toHaveBeenCalled();
	});

	it('does not preview on invalid JSON', async () => {
		await expect(POST(makeEvent('{not json') as any)).rejects.toMatchObject({ status: 400 });
		expect(previewBatchMerge).not.toHaveBeenCalled();
	});

	it('does not preview when candidate_ids is missing', async () => {
		await expect(
			POST(
				makeEvent(
					JSON.stringify({ entitlement_strategy: 'union', attribute_rule: 'newest_wins' })
				) as any
			)
		).rejects.toMatchObject({ status: 400 });
		expect(previewBatchMerge).not.toHaveBeenCalled();
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
		expect(previewBatchMerge).not.toHaveBeenCalled();
	});
});
