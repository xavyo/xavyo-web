import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/api/reconciliation', () => ({
	previewRemediation: vi.fn()
}));

import { POST } from './+server';
import { previewRemediation } from '$lib/api/reconciliation';

const TOKEN = 'tok';
const TENANT = 'tid';

function makeEvent(body: string) {
	return {
		params: { id: 'c1' },
		locals: { accessToken: TOKEN, tenantId: TENANT },
		fetch: vi.fn(),
		request: new Request(
			'http://localhost/api/connectors/c1/reconciliation/discrepancies/preview',
			{
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body
			}
		)
	};
}

describe('POST /api/connectors/:id/reconciliation/discrepancies/preview', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('previews with required fields', async () => {
		vi.mocked(previewRemediation).mockResolvedValue({ previews: [] } as any);
		const response = await POST(makeEvent(JSON.stringify({ discrepancy_ids: ['d1'] })) as any);
		expect(response.status).toBe(200);
		expect(previewRemediation).toHaveBeenCalled();
	});

	it('does not preview on invalid JSON', async () => {
		await expect(POST(makeEvent('{not json') as any)).rejects.toMatchObject({ status: 400 });
		expect(previewRemediation).not.toHaveBeenCalled();
	});

	it('does not preview when discrepancy_ids is missing', async () => {
		await expect(POST(makeEvent(JSON.stringify({})) as any)).rejects.toMatchObject({ status: 400 });
		expect(previewRemediation).not.toHaveBeenCalled();
	});
});
