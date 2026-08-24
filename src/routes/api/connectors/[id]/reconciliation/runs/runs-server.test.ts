import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/api/reconciliation', () => ({
	listRuns: vi.fn(),
	triggerRun: vi.fn()
}));

import { POST } from './+server';
import { triggerRun } from '$lib/api/reconciliation';

const TOKEN = 'tok';
const TENANT = 'tid';

function makeEvent(body: string) {
	return {
		params: { id: 'c1' },
		locals: { accessToken: TOKEN, tenantId: TENANT },
		fetch: vi.fn(),
		request: new Request('http://localhost/api/connectors/c1/reconciliation/runs', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body
		})
	};
}

describe('POST /api/connectors/:id/reconciliation/runs', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('triggers a run with required fields', async () => {
		vi.mocked(triggerRun).mockResolvedValue({ id: 'r1' } as any);
		const response = await POST(makeEvent(JSON.stringify({ mode: 'full', dry_run: true })) as any);
		expect(response.status).toBe(202);
		expect(triggerRun).toHaveBeenCalled();
	});

	it('does not trigger on invalid JSON', async () => {
		await expect(POST(makeEvent('{not json') as any)).rejects.toMatchObject({ status: 400 });
		expect(triggerRun).not.toHaveBeenCalled();
	});

	it('does not trigger when mode is invalid', async () => {
		await expect(
			POST(makeEvent(JSON.stringify({ mode: 'other', dry_run: true })) as any)
		).rejects.toMatchObject({ status: 400 });
		expect(triggerRun).not.toHaveBeenCalled();
	});
});
