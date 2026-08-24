import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/api/reconciliation', () => ({
	remediateDiscrepancy: vi.fn()
}));

import { POST } from './+server';
import { remediateDiscrepancy } from '$lib/api/reconciliation';

const TOKEN = 'tok';
const TENANT = 'tid';

function makeEvent(body: string) {
	return {
		params: { id: 'c1', discrepancyId: 'd1' },
		locals: { accessToken: TOKEN, tenantId: TENANT },
		fetch: vi.fn(),
		request: new Request(
			'http://localhost/api/connectors/c1/reconciliation/discrepancies/d1/remediate',
			{
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body
			}
		)
	};
}

describe('POST /api/connectors/:id/reconciliation/discrepancies/:discrepancyId/remediate', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('remediates with required fields', async () => {
		vi.mocked(remediateDiscrepancy).mockResolvedValue({ success: true } as any);
		const response = await POST(
			makeEvent(
				JSON.stringify({ action: 'update', direction: 'xavyo_to_target', dry_run: true })
			) as any
		);
		expect(response.status).toBe(200);
		expect(remediateDiscrepancy).toHaveBeenCalled();
	});

	it('does not remediate on invalid JSON', async () => {
		await expect(POST(makeEvent('{not json') as any)).rejects.toMatchObject({ status: 400 });
		expect(remediateDiscrepancy).not.toHaveBeenCalled();
	});

	it('does not remediate when action is invalid', async () => {
		await expect(
			POST(
				makeEvent(
					JSON.stringify({ action: 'other', direction: 'xavyo_to_target', dry_run: true })
				) as any
			)
		).rejects.toMatchObject({ status: 400 });
		expect(remediateDiscrepancy).not.toHaveBeenCalled();
	});
});
