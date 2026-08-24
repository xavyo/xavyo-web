import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/api/reconciliation', () => ({
	bulkRemediate: vi.fn()
}));

import { POST } from './+server';
import { bulkRemediate } from '$lib/api/reconciliation';

const TOKEN = 'tok';
const TENANT = 'tid';

function makeEvent(body: string) {
	return {
		locals: { accessToken: TOKEN, tenantId: TENANT },
		params: { id: 'conn-1' },
		fetch: vi.fn(),
		request: new Request(
			'http://localhost/api/connectors/conn-1/reconciliation/discrepancies/bulk-remediate',
			{
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body
			}
		)
	};
}

describe('POST /api/connectors/:id/reconciliation/discrepancies/bulk-remediate', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('remediates with items and dry_run', async () => {
		vi.mocked(bulkRemediate).mockResolvedValue({ total: 1 } as any);
		const response = await POST(
			makeEvent(JSON.stringify({ items: [{ discrepancy_id: 'd1' }], dry_run: true })) as any
		);
		expect(response.status).toBe(200);
		expect(bulkRemediate).toHaveBeenCalled();
	});

	it('does not remediate on invalid JSON', async () => {
		await expect(POST(makeEvent('{not json') as any)).rejects.toMatchObject({ status: 400 });
		expect(bulkRemediate).not.toHaveBeenCalled();
	});

	it('does not remediate when items is missing', async () => {
		await expect(POST(makeEvent(JSON.stringify({ dry_run: true })) as any)).rejects.toMatchObject({
			status: 400
		});
		expect(bulkRemediate).not.toHaveBeenCalled();
	});
});
