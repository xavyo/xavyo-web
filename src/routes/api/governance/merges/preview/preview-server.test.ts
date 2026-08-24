import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/api/dedup', () => ({
	previewMerge: vi.fn()
}));

import { POST } from './+server';
import { previewMerge } from '$lib/api/dedup';

const TOKEN = 'tok';
const TENANT = 'tid';

function makeEvent(body: string) {
	return {
		locals: { accessToken: TOKEN, tenantId: TENANT },
		fetch: vi.fn(),
		request: new Request('http://localhost/api/governance/merges/preview', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body
		})
	};
}

describe('POST /api/governance/merges/preview', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('previews with required fields', async () => {
		vi.mocked(previewMerge).mockResolvedValue({ ok: true } as any);
		const response = await POST(
			makeEvent(
				JSON.stringify({
					source_identity_id: 'a',
					target_identity_id: 'b',
					entitlement_strategy: 'union'
				})
			) as any
		);
		expect(response.status).toBe(200);
		expect(previewMerge).toHaveBeenCalled();
	});

	it('does not preview on invalid JSON', async () => {
		await expect(POST(makeEvent('{not json') as any)).rejects.toMatchObject({ status: 400 });
		expect(previewMerge).not.toHaveBeenCalled();
	});

	it('does not preview when source_identity_id is missing', async () => {
		await expect(
			POST(
				makeEvent(
					JSON.stringify({ target_identity_id: 'b', entitlement_strategy: 'union' })
				) as any
			)
		).rejects.toMatchObject({ status: 400 });
		expect(previewMerge).not.toHaveBeenCalled();
	});
});
